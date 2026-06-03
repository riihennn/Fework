"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleBooking = exports.cancelBooking = exports.workerEventStream = exports.getClientBookings = exports.getWorkerBookings = exports.approveJob = exports.updateJobStatus = exports.respondToBooking = exports.createBooking = void 0;
const Worker_model_1 = __importDefault(require("../models/Worker.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const ChatRoom_model_1 = __importDefault(require("../models/ChatRoom.model"));
const sse_service_1 = require("../services/sse.service");
const response_utils_1 = require("../utils/response.utils");
const Message_model_1 = __importDefault(require("../models/Message.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const app_1 = require("../app");
/**
 * @desc    Client creates a booking request for a worker
 * @route   POST /api/bookings
 * @access  Private (Client only)
 */
const createBooking = async (req, res, next) => {
    try {
        const { workerId, service, description, location, scheduledAt, estimatedPay, isUrgent } = req.body;
        if (!workerId || !service || !description || !location || !scheduledAt || (estimatedPay === undefined || estimatedPay === null)) {
            return (0, response_utils_1.sendError)(res, "Missing required booking fields", 400);
        }
        // Verify the worker exists and is available
        const worker = await Worker_model_1.default.findById(workerId).populate("user", "name email");
        if (!worker)
            return (0, response_utils_1.sendError)(res, "Worker not found", 404);
        if (!worker.isAvailable)
            return (0, response_utils_1.sendError)(res, "Worker is currently unavailable", 409);
        // Create the job record
        const job = await Booking_model_1.default.create({
            client: req.user.id,
            worker: workerId,
            service,
            description,
            location,
            scheduledAt: new Date(scheduledAt),
            estimatedPay: Number(estimatedPay),
            isUrgent: Boolean(isUrgent),
            status: "pending",
        });
        // Automatically create a ChatRoom for this booking
        await ChatRoom_model_1.default.create({
            bookingId: job._id,
            clientId: job.client,
            workerId: job.worker,
        });
        // Populate client info for the SSE payload
        const populated = await job.populate("client", "name email avatar phone");
        // 🔔 Push real-time notification to the worker
        const workerUserId = worker.user?._id?.toString() || worker.user?.toString();
        app_1.socketService.emitToRoom(`user_${workerUserId}`, "new_booking", {
            job: {
                id: job._id,
                client: populated.client?.name || "Unknown Client",
                clientAvatar: populated.client?.avatar || null,
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
        (0, response_utils_1.sendSuccess)(res, "Booking request sent successfully", { jobId: job._id }, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createBooking = createBooking;
/**
 * @desc    Worker responds to a booking (accept or decline)
 * @route   PUT /api/bookings/:jobId/respond
 * @access  Private (Worker only)
 */
const respondToBooking = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { action } = req.body; // "accept" | "decline"
        if (!["accept", "decline"].includes(action)) {
            return (0, response_utils_1.sendError)(res, "Action must be 'accept' or 'decline'", 400);
        }
        const worker = await Worker_model_1.default.findOne({ user: req.user.id });
        if (!worker)
            return (0, response_utils_1.sendError)(res, "Worker profile not found", 404);
        const job = await Booking_model_1.default.findOne({ _id: jobId, worker: worker._id });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Job not found", 404);
        if (job.status !== "pending") {
            if (action === "accept" && job.status === "accepted") {
                return (0, response_utils_1.sendSuccess)(res, "Booking already accepted", { status: job.status });
            }
            if (action === "decline" && job.status === "cancelled") {
                return (0, response_utils_1.sendSuccess)(res, "Booking already declined", { status: job.status });
            }
            return (0, response_utils_1.sendError)(res, "Job is no longer pending", 409);
        }
        job.status = action === "accept" ? "accepted" : "cancelled";
        await job.save();
        // 🔔 Notify the client via SSE (future: when client SSE is implemented)
        // For now, also notify the worker's dashboard to refresh the job list
        const workerUserId = worker.user.toString();
        app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
            jobId: job._id,
            status: job.status,
        });
        app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
            jobId: job._id,
            status: job.status,
        });
        if (action === "accept") {
            const chatRoom = await ChatRoom_model_1.default.findOne({ bookingId: job._id });
            if (chatRoom) {
                const welcomeMsg = await Message_model_1.default.create({
                    roomId: chatRoom._id,
                    senderId: req.user.id,
                    senderRole: "worker",
                    message: "I have accepted your offer! I'm ready to get started. Let me know if you have any questions.",
                });
                chatRoom.lastMessage = welcomeMsg.message;
                chatRoom.lastMessageAt = welcomeMsg.createdAt;
                await chatRoom.save();
                app_1.socketService.emitToRoom(job._id.toString(), "receive_message", welcomeMsg);
                // Find the worker's user name and emit a message notification to the client's user room
                const senderUser = await User_model_1.default.findById(req.user.id);
                const senderName = senderUser ? senderUser.name : "Worker";
                app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "message_notification", {
                    jobId: job._id.toString(),
                    senderName,
                    message: welcomeMsg.message,
                    createdAt: welcomeMsg.createdAt,
                });
            }
        }
        (0, response_utils_1.sendSuccess)(res, `Booking ${action}ed successfully`, { status: job.status });
    }
    catch (error) {
        next(error);
    }
};
exports.respondToBooking = respondToBooking;
/**
 * @desc    Worker updates job status (in_progress, awaiting_approval)
 * @route   PUT /api/bookings/:jobId/status
 * @access  Private (Worker only)
 */
const updateJobStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { status, actualPay, workerNote } = req.body;
        // Workers can ONLY advance to in_progress or awaiting_approval
        // Completed is ONLY set by the client (via approveJob)
        const validTransitions = {
            accepted: ["in_progress", "cancelled"],
            in_progress: ["awaiting_approval", "cancelled"],
            disputed: ["awaiting_approval"], // worker can re-submit after a dispute
        };
        const worker = await Worker_model_1.default.findOne({ user: req.user.id });
        if (!worker)
            return (0, response_utils_1.sendError)(res, "Worker profile not found", 404);
        const job = await Booking_model_1.default.findOne({ _id: jobId, worker: worker._id });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Job not found", 404);
        const allowed = validTransitions[job.status] || [];
        // If the job is already in the requested status, return success (idempotency)
        if (job.status === status) {
            return (0, response_utils_1.sendSuccess)(res, "Job status already updated", { status: job.status });
        }
        if (!allowed.includes(status)) {
            return (0, response_utils_1.sendError)(res, `Cannot transition from '${job.status}' to '${status}'`, 409);
        }
        job.status = status;
        if (status === "in_progress") {
            job.startedAt = new Date();
        }
        else if (status === "awaiting_approval") {
            job.endedAt = new Date();
            if (job.startedAt && worker.hourlyRate) {
                const durationInMs = job.endedAt.getTime() - job.startedAt.getTime();
                const durationInHours = Math.max(1, durationInMs / (1000 * 60 * 60)); // minimum 1 hour charge
                job.actualPay = Math.round(durationInHours * worker.hourlyRate * 100) / 100; // round to 2 decimals
            }
        }
        if (actualPay && status !== "awaiting_approval")
            job.actualPay = actualPay;
        if (workerNote)
            job.workerNote = workerNote;
        await job.save();
        if (status === "cancelled") {
            await ChatRoom_model_1.default.updateOne({ bookingId: job._id }, { isLocked: true });
        }
        const workerUserId = worker.user.toString();
        app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
            jobId: job._id,
            status: job.status,
        });
        app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
            jobId: job._id,
            status: job.status,
        });
        (0, response_utils_1.sendSuccess)(res, "Job status updated", { status: job.status });
    }
    catch (error) {
        next(error);
    }
};
exports.updateJobStatus = updateJobStatus;
/**
 * @desc    Client approves or disputes job completion
 * @route   PUT /api/bookings/:jobId/approve
 * @access  Private (Client only)
 */
const approveJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { action, note, actualPay } = req.body; // action: "approve" | "dispute"
        if (!action || !["approve", "dispute"].includes(action)) {
            return (0, response_utils_1.sendError)(res, "Invalid action. Use 'approve' or 'dispute'", 400);
        }
        const job = await Booking_model_1.default.findOne({ _id: jobId, client: req.user.id });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Job not found", 404);
        if (job.status !== "awaiting_approval") {
            return (0, response_utils_1.sendError)(res, "Job is not awaiting approval", 409);
        }
        if (action === "approve") {
            job.status = "completed";
            job.paymentStatus = "paid";
            job.actualPay = actualPay || job.estimatedPay;
            job.clientApproval = { approved: true, note, approvedAt: new Date() };
            await ChatRoom_model_1.default.updateOne({ bookingId: job._id }, { isLocked: true });
            const worker = await Worker_model_1.default.findById(job.worker);
            if (worker) {
                await Worker_model_1.default.findByIdAndUpdate(worker._id, { $inc: { totalJobs: 1 } });
                const workerUserId = worker.user.toString();
                app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
                    jobId: job._id, status: "completed",
                });
                app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
                    jobId: job._id, status: "completed",
                });
            }
        }
        else {
            job.status = "disputed";
            job.clientApproval = { approved: false, note, approvedAt: new Date() };
            const worker = await Worker_model_1.default.findById(job.worker);
            if (worker) {
                const workerUserId = worker.user.toString();
                app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
                    jobId: job._id, status: "disputed",
                });
                app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
                    jobId: job._id, status: "disputed",
                });
            }
        }
        await job.save();
        (0, response_utils_1.sendSuccess)(res, `Job ${action}d successfully`, {
            status: job.status,
            paymentStatus: job.paymentStatus,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveJob = approveJob;
/**
 * @desc    Get all bookings for the currently logged-in worker
 * @route   GET /api/bookings/worker
 * @access  Private (Worker only)
 */
const getWorkerBookings = async (req, res, next) => {
    try {
        const { status, page = "1", limit = "10", search } = req.query;
        const worker = await Worker_model_1.default.findOne({ user: req.user.id });
        if (!worker)
            return (0, response_utils_1.sendError)(res, "Worker profile not found", 404);
        const query = { worker: worker._id };
        if (status) {
            const statusStr = String(status);
            if (statusStr.includes(",")) {
                query.status = { $in: statusStr.split(",") };
            }
            else {
                query.status = statusStr;
            }
        }
        if (search) {
            const searchRegex = new RegExp(String(search), "i");
            const matchingUsers = await User_model_1.default.find({
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');
            const userIds = matchingUsers.map((u) => u._id);
            query.$or = [
                { service: searchRegex },
                { location: searchRegex },
                { description: searchRegex },
                { client: { $in: userIds } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [jobs, total] = await Promise.all([
            Booking_model_1.default.find(query)
                .populate("client", "name email avatar phone")
                .sort("-createdAt")
                .skip(skip)
                .limit(Number(limit)),
            Booking_model_1.default.countDocuments(query),
        ]);
        (0, response_utils_1.sendSuccess)(res, "Bookings retrieved", {
            jobs,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkerBookings = getWorkerBookings;
/**
 * @desc    Get all bookings for the currently logged-in client
 * @route   GET /api/bookings/client
 * @access  Private (Client only)
 */
const getClientBookings = async (req, res, next) => {
    try {
        const { status, page = "1", limit = "10", search } = req.query;
        const query = { client: req.user.id };
        if (status) {
            const statusStr = String(status);
            if (statusStr.includes(",")) {
                query.status = { $in: statusStr.split(",") };
            }
            else {
                query.status = statusStr;
            }
        }
        if (search) {
            const searchRegex = new RegExp(String(search), "i");
            const matchingUsers = await User_model_1.default.find({
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');
            const matchingWorkers = await Worker_model_1.default.find({ user: { $in: matchingUsers.map(u => u._id) } }).select('_id');
            const workerIds = matchingWorkers.map((w) => w._id);
            query.$or = [
                { service: searchRegex },
                { location: searchRegex },
                { description: searchRegex },
                { worker: { $in: workerIds } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [jobs, total] = await Promise.all([
            Booking_model_1.default.find(query)
                .populate({
                path: "worker",
                populate: { path: "user", select: "name email avatar phone" }
            })
                .sort("-createdAt")
                .skip(skip)
                .limit(Number(limit)),
            Booking_model_1.default.countDocuments(query),
        ]);
        (0, response_utils_1.sendSuccess)(res, "Client bookings retrieved", {
            jobs,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getClientBookings = getClientBookings;
/**
 * @desc    SSE stream — worker subscribes to real-time job events
 * @route   GET /api/bookings/stream
 * @access  Private (Worker only)
 */
const workerEventStream = async (req, res, next) => {
    try {
        const worker = await Worker_model_1.default.findOne({ user: req.user.id });
        if (!worker) {
            res.status(404).end();
            return;
        }
        const clientId = `${worker._id}-${Date.now()}`;
        sse_service_1.sseService.addClient(worker._id.toString(), clientId, res);
        console.log(`[SSE] Worker ${worker._id} connected (clientId: ${clientId})`);
    }
    catch (error) {
        next(error);
    }
};
exports.workerEventStream = workerEventStream;
/**
 * @desc    Client cancels a booking
 * @route   PUT /api/bookings/:jobId/cancel
 * @access  Private (Client only)
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;
        const job = await Booking_model_1.default.findOne({ _id: jobId, client: req.user.id });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Booking not found", 404);
        const cancellableStatuses = ["pending", "accepted"];
        if (!cancellableStatuses.includes(job.status)) {
            return (0, response_utils_1.sendError)(res, `Cannot cancel a booking that is '${job.status}'. Only pending or accepted bookings can be cancelled.`, 409);
        }
        job.status = "cancelled";
        if (reason)
            job.workerNote = `Cancelled by client: ${reason}`;
        await job.save();
        // Notify worker
        const worker = await Worker_model_1.default.findById(job.worker);
        if (worker) {
            const workerUserId = worker.user.toString();
            app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
                jobId: job._id,
                status: "cancelled",
            });
            app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
                jobId: job._id,
                status: "cancelled",
            });
        }
        (0, response_utils_1.sendSuccess)(res, "Booking cancelled successfully", { status: job.status });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelBooking = cancelBooking;
/**
 * @desc    Client reschedules a booking
 * @route   PUT /api/bookings/:jobId/reschedule
 * @access  Private (Client only)
 */
const rescheduleBooking = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { scheduledAt } = req.body;
        if (!scheduledAt)
            return (0, response_utils_1.sendError)(res, "New scheduled date/time is required", 400);
        const newDate = new Date(scheduledAt);
        if (isNaN(newDate.getTime()))
            return (0, response_utils_1.sendError)(res, "Invalid date format", 400);
        if (newDate <= new Date())
            return (0, response_utils_1.sendError)(res, "Rescheduled time must be in the future", 400);
        const job = await Booking_model_1.default.findOne({ _id: jobId, client: req.user.id });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Booking not found", 404);
        const reschedulableStatuses = ["pending", "accepted"];
        if (!reschedulableStatuses.includes(job.status)) {
            return (0, response_utils_1.sendError)(res, `Cannot reschedule a booking that is '${job.status}'. Only pending or accepted bookings can be rescheduled.`, 409);
        }
        // ── 1-reschedule limit ──────────────────────────────────────────
        if ((job.rescheduledCount || 0) >= 1) {
            return (0, response_utils_1.sendError)(res, "This booking has already been rescheduled once. You cannot reschedule it again.", 409);
        }
        job.scheduledAt = newDate;
        job.rescheduledCount = (job.rescheduledCount || 0) + 1;
        await job.save();
        // Notify worker
        const worker = await Worker_model_1.default.findById(job.worker);
        if (worker) {
            const workerUserId = worker.user.toString();
            app_1.socketService.emitToRoom(`user_${workerUserId}`, "booking_updated", {
                jobId: job._id,
                status: job.status,
                scheduledAt: newDate,
            });
            app_1.socketService.emitToRoom(`user_${job.client.toString()}`, "booking_updated", {
                jobId: job._id,
                status: job.status,
                scheduledAt: newDate,
            });
        }
        (0, response_utils_1.sendSuccess)(res, "Booking rescheduled successfully", {
            scheduledAt: newDate,
            status: job.status,
            rescheduledCount: job.rescheduledCount,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rescheduleBooking = rescheduleBooking;
//# sourceMappingURL=booking.controller.js.map