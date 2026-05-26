import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import Job from "../models/Booking.model";
import Worker from "../models/Worker.model";
import { sseService } from "../services/sse.service";
import { sendSuccess, sendError } from "../utils/response.utils";

/**
 * @desc    Client creates a booking request for a worker
 * @route   POST /api/bookings
 * @access  Private (Client only)
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workerId, service, description, location, scheduledAt, estimatedPay, isUrgent } = req.body;

    if (!workerId || !service || !description || !location || !scheduledAt || (estimatedPay === undefined || estimatedPay === null)) {
      return sendError(res, "Missing required booking fields", 400);
    }

    // Verify the worker exists and is available
    const worker = await Worker.findById(workerId).populate("user", "name email");
    if (!worker) return sendError(res, "Worker not found", 404);
    if (!worker.isAvailable) return sendError(res, "Worker is currently unavailable", 409);

    // Create the job record
    const job = await Job.create({
      client: req.user!.id,
      worker: workerId,
      service,
      description,
      location,
      scheduledAt: new Date(scheduledAt),
      estimatedPay: Number(estimatedPay),
      isUrgent: Boolean(isUrgent),
      status: "pending",
    });

    // Populate client info for the SSE payload
    const populated = await job.populate("client", "name email avatar phone");

    // 🔔 Push real-time notification to the worker
    sseService.sendToWorker(workerId, "new_booking", {
      job: {
        id: job._id,
        client: (populated.client as any)?.name || "Unknown Client",
        clientAvatar: (populated.client as any)?.avatar || null,
        service,
        description,
        location,
        scheduledAt: job.scheduledAt,
        estimatedPay: job.estimatedPay,
        isUrgent: job.isUrgent,
        status: job.status,
        createdAt: job.createdAt,
      },
    });

    sendSuccess(res, "Booking request sent successfully", { jobId: job._id }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Worker responds to a booking (accept or decline)
 * @route   PUT /api/bookings/:jobId/respond
 * @access  Private (Worker only)
 */
export const respondToBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { action } = req.body; // "accept" | "decline"

    if (!["accept", "decline"].includes(action)) {
      return sendError(res, "Action must be 'accept' or 'decline'", 400);
    }

    const worker = await Worker.findOne({ user: req.user!.id });
    if (!worker) return sendError(res, "Worker profile not found", 404);

    const job = await Job.findOne({ _id: jobId, worker: worker._id });
    if (!job) return sendError(res, "Job not found", 404);
    
    if (job.status !== "pending") {
      if (action === "accept" && job.status === "accepted") {
        return sendSuccess(res, "Booking already accepted", { status: job.status });
      }
      if (action === "decline" && job.status === "cancelled") {
        return sendSuccess(res, "Booking already declined", { status: job.status });
      }
      return sendError(res, "Job is no longer pending", 409);
    }

    job.status = action === "accept" ? "accepted" : "cancelled";
    await job.save();

    // 🔔 Notify the client via SSE (future: when client SSE is implemented)
    // For now, also notify the worker's dashboard to refresh the job list
    sseService.sendToWorker(worker._id.toString(), "booking_updated", {
      jobId: job._id,
      status: job.status,
    });

    sendSuccess(res, `Booking ${action}ed successfully`, { status: job.status });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Worker updates job status (in_progress, awaiting_approval)
 * @route   PUT /api/bookings/:jobId/status
 * @access  Private (Worker only)
 */
export const updateJobStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { status, actualPay, workerNote } = req.body;

    // Workers can ONLY advance to in_progress or awaiting_approval
    // Completed is ONLY set by the client (via approveJob)
    const validTransitions: Record<string, string[]> = {
      accepted: ["in_progress", "cancelled"],
      in_progress: ["awaiting_approval", "cancelled"],
      disputed:  ["awaiting_approval"], // worker can re-submit after a dispute
    };

    const worker = await Worker.findOne({ user: req.user!.id });
    if (!worker) return sendError(res, "Worker profile not found", 404);

    const job = await Job.findOne({ _id: jobId, worker: worker._id });
    if (!job) return sendError(res, "Job not found", 404);

    const allowed = validTransitions[job.status] || [];
    
    // If the job is already in the requested status, return success (idempotency)
    if (job.status === status) {
      return sendSuccess(res, "Job status already updated", { status: job.status });
    }

    if (!allowed.includes(status)) {
      return sendError(res, `Cannot transition from '${job.status}' to '${status}'`, 409);
    }

    job.status = status;
    if (status === "in_progress") {
      job.startedAt = new Date();
    } else if (status === "awaiting_approval") {
      job.endedAt = new Date();
      if (job.startedAt && worker.hourlyRate) {
        const durationInMs = job.endedAt.getTime() - job.startedAt.getTime();
        const durationInHours = Math.max(1, durationInMs / (1000 * 60 * 60)); // minimum 1 hour charge
        job.actualPay = Math.round(durationInHours * worker.hourlyRate * 100) / 100; // round to 2 decimals
      }
    }

    if (actualPay && status !== "awaiting_approval") job.actualPay = actualPay;
    if (workerNote) job.workerNote = workerNote;
    await job.save();

    sseService.sendToWorker(worker._id.toString(), "booking_updated", {
      jobId: job._id,
      status: job.status,
    });

    sendSuccess(res, "Job status updated", { status: job.status });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Client approves or disputes job completion
 * @route   PUT /api/bookings/:jobId/approve
 * @access  Private (Client only)
 */
export const approveJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { action, note, actualPay } = req.body; // action: "approve" | "dispute"

    if (!action || !["approve", "dispute"].includes(action)) {
      return sendError(res, "Invalid action. Use 'approve' or 'dispute'", 400);
    }

    const job = await Job.findOne({ _id: jobId, client: req.user!.id });
    if (!job) return sendError(res, "Job not found", 404);

    if (job.status !== "awaiting_approval") {
      return sendError(res, "Job is not awaiting approval", 409);
    }

    if (action === "approve") {
      job.status = "completed";
      job.paymentStatus = "paid";
      job.actualPay = actualPay || job.estimatedPay;
      job.clientApproval = { approved: true, note, approvedAt: new Date() };

      const worker = await Worker.findById(job.worker);
      if (worker) {
        await Worker.findByIdAndUpdate(worker._id, { $inc: { totalJobs: 1 } });
        sseService.sendToWorker(worker._id.toString(), "booking_updated", {
          jobId: job._id, status: "completed",
        });
      }
    } else {
      job.status = "disputed";
      job.clientApproval = { approved: false, note, approvedAt: new Date() };

      const worker = await Worker.findById(job.worker);
      if (worker) {
        sseService.sendToWorker(worker._id.toString(), "booking_updated", {
          jobId: job._id, status: "disputed",
        });
      }
    }

    await job.save();
    sendSuccess(res, `Job ${action}d successfully`, {
      status: job.status,
      paymentStatus: job.paymentStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the currently logged-in worker
 * @route   GET /api/bookings/worker
 * @access  Private (Worker only)
 */
export const getWorkerBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const worker = await Worker.findOne({ user: req.user!.id });
    if (!worker) return sendError(res, "Worker profile not found", 404);

    const query: any = { worker: worker._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("client", "name email avatar phone")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    sendSuccess(res, "Bookings retrieved", {
      jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the currently logged-in client
 * @route   GET /api/bookings/client
 * @access  Private (Client only)
 */
export const getClientBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const query: any = { client: req.user!.id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate({
          path: "worker",
          populate: { path: "user", select: "name email avatar phone" }
        })
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(query),
    ]);

    sendSuccess(res, "Client bookings retrieved", {
      jobs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    SSE stream — worker subscribes to real-time job events
 * @route   GET /api/bookings/stream
 * @access  Private (Worker only)
 */
export const workerEventStream = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findOne({ user: req.user!.id });
    if (!worker) {
      res.status(404).end();
      return;
    }

    const clientId = `${worker._id}-${Date.now()}`;
    sseService.addClient(worker._id.toString(), clientId, res);
    console.log(`[SSE] Worker ${worker._id} connected (clientId: ${clientId})`);
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Client cancels a booking
 * @route   PUT /api/bookings/:jobId/cancel
 * @access  Private (Client only)
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await Job.findOne({ _id: jobId, client: req.user!.id });
    if (!job) return sendError(res, "Booking not found", 404);

    const cancellableStatuses = ["pending", "accepted"];
    if (!cancellableStatuses.includes(job.status)) {
      return sendError(
        res,
        `Cannot cancel a booking that is '${job.status}'. Only pending or accepted bookings can be cancelled.`,
        409
      );
    }

    job.status = "cancelled";
    if (reason) job.workerNote = `Cancelled by client: ${reason}`;
    await job.save();

    // Notify worker
    const worker = await Worker.findById(job.worker);
    if (worker) {
      sseService.sendToWorker(worker._id.toString(), "booking_updated", {
        jobId: job._id,
        status: "cancelled",
      });
    }

    sendSuccess(res, "Booking cancelled successfully", { status: job.status });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Client reschedules a booking
 * @route   PUT /api/bookings/:jobId/reschedule
 * @access  Private (Client only)
 */
export const rescheduleBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) return sendError(res, "New scheduled date/time is required", 400);

    const newDate = new Date(scheduledAt);
    if (isNaN(newDate.getTime())) return sendError(res, "Invalid date format", 400);
    if (newDate <= new Date()) return sendError(res, "Rescheduled time must be in the future", 400);

    const job = await Job.findOne({ _id: jobId, client: req.user!.id });
    if (!job) return sendError(res, "Booking not found", 404);

    const reschedulableStatuses = ["pending", "accepted"];
    if (!reschedulableStatuses.includes(job.status)) {
      return sendError(
        res,
        `Cannot reschedule a booking that is '${job.status}'. Only pending or accepted bookings can be rescheduled.`,
        409
      );
    }

    // ── 1-reschedule limit ──────────────────────────────────────────
    if ((job.rescheduledCount || 0) >= 1) {
      return sendError(
        res,
        "This booking has already been rescheduled once. You cannot reschedule it again.",
        409
      );
    }

    job.scheduledAt = newDate;
    job.rescheduledCount = (job.rescheduledCount || 0) + 1;
    await job.save();

    // Notify worker
    const worker = await Worker.findById(job.worker);
    if (worker) {
      sseService.sendToWorker(worker._id.toString(), "booking_updated", {
        jobId: job._id,
        status: job.status,
        scheduledAt: newDate,
      });
    }

    sendSuccess(res, "Booking rescheduled successfully", {
      scheduledAt: newDate,
      status: job.status,
      rescheduledCount: job.rescheduledCount,
    });
  } catch (error) {
    next(error);
  }
};
