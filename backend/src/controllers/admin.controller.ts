import { Response } from "express";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response.utils";
import User from "../models/User.model";
import Worker from "../models/Worker.model";
import Job from "../models/Booking.model";
import Review from "../models/Review.model";

// ── GET /api/admin/stats ──────────────────────────────────────
export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalWorkers, totalBookings, revenueResult] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Worker.countDocuments(),
      Job.countDocuments(),
      Job.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$actualPay" } } },
      ]),
    ]);

    const [
      clientCount,
      workerCount,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings,
      recentUsers,
      bookingsByStatus,
    ] = await Promise.all([
      User.countDocuments({ role: "client" }),
      User.countDocuments({ role: "worker" }),
      Job.countDocuments({ status: "pending" }),
      Job.countDocuments({ status: "completed" }),
      Job.countDocuments({ status: "cancelled" }),
      Job.countDocuments({ status: "disputed" }),
      User.find({ role: { $ne: "admin" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role avatar createdAt"),
      Job.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    // Growth — new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({
      role: { $ne: "admin" },
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Trend Data for Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendJobs = await Job.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "completed"] }, "$actualPay", 0] 
            } 
          },
          bookings: { $sum: 1 }
        }
      }
    ]);

    const trendData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const match = trendJobs.find(t => t._id === dateStr);
      trendData.push({
        name: days[d.getDay()],
        revenue: match ? match.revenue : 0,
        bookings: match ? match.bookings : 0
      });
    }

    sendSuccess(res, "Stats fetched successfully.", {
      overview: {
        totalUsers,
        totalWorkers,
        totalBookings,
        totalRevenue: revenueResult[0]?.total ?? 0,
        clientCount,
        workerCount,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        disputedBookings,
        newUsersThisMonth,
      },
      recentUsers,
      bookingsByStatus,
      trendData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats.";
    sendError(res, message, 500);
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { role: { $ne: "admin" } };
    if (role && ["client", "worker"].includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password"),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, "Users fetched successfully.", {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users.";
    sendError(res, message, 500);
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, "User not found.", 404); return; }
    if (user.role === "admin") { sendError(res, "Cannot delete an admin account.", 403); return; }

    await User.findByIdAndDelete(req.params.id);
    // Also delete worker profile if exists
    await Worker.findOneAndDelete({ user: req.params.id });

    sendSuccess(res, "User deleted successfully.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete user.";
    sendError(res, message, 500);
  }
};

// ── PATCH /api/admin/users/:id/block ──────────────────────────
export const toggleBlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { sendError(res, "User not found.", 404); return; }
    if (user.role === "admin") { sendError(res, "Cannot block an admin account.", 403); return; }

    user.isBlocked = !user.isBlocked;
    await user.save();

    sendSuccess(res, `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`, {
      isBlocked: user.isBlocked,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle block status.";
    sendError(res, message, 500);
  }
};

// ── GET /api/admin/workers ────────────────────────────────────
export const getWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const pipeline: Record<string, unknown>[] = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "userInfo.name": { $regex: search, $options: "i" } },
            { "userInfo.email": { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          category: 1,
          rating: 1,
          totalJobs: 1,
          isAvailable: 1,
          isElite: 1,
          hourlyRate: 1,
          city: 1,
          createdAt: 1,
          "userInfo.name": 1,
          "userInfo.email": 1,
          "userInfo.avatar": 1,
        },
      },
    ];

    const [workers, countResult] = await Promise.all([
      Worker.aggregate(dataPipeline as any),
      Worker.aggregate(countPipeline as any),
    ]);

    const total = countResult[0]?.total ?? 0;

    sendSuccess(res, "Workers fetched successfully.", {
      workers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch workers.";
    sendError(res, message, 500);
  }
};

// ── GET /api/admin/workers/:id ────────────────────────────────
export const getWorkerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const worker = await Worker.findById(req.params.id).populate("user", "-password").lean();
    if (!worker) {
      sendError(res, "Worker not found.", 404);
      return;
    }
    
    // Fetch recent bookings for this worker
    const recentBookings = await Job.find({ worker: worker._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("client", "name email avatar")
      .lean();

    // Fetch recent reviews for this worker
    const recentReviews = await Review.find({ worker: worker._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("client", "name email avatar")
      .lean();

    sendSuccess(res, "Worker fetched successfully.", {
      worker: {
        ...worker,
        userInfo: worker.user, // normalize for frontend
      },
      recentBookings,
      recentReviews,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch worker details.";
    sendError(res, message, 500);
  }
};

// ── PATCH /api/admin/workers/:id/elite ───────────────────────
export const toggleElite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) { sendError(res, "Worker not found.", 404); return; }

    worker.isElite = !worker.isElite;
    await worker.save();
    sendSuccess(res, `Worker ${worker.isElite ? "promoted to" : "removed from"} Elite.`, {
      isElite: worker.isElite,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle elite status.";
    sendError(res, message, 500);
  }
};

// ── GET /api/admin/bookings ───────────────────────────────────
export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string | undefined;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const [bookings, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("client", "name email avatar")
        .populate({ path: "worker", populate: { path: "user", select: "name email avatar" } }),
      Job.countDocuments(filter),
    ]);

    sendSuccess(res, "Bookings fetched successfully.", {
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch bookings.";
    sendError(res, message, 500);
  }
};

// ── PATCH /api/admin/bookings/:id/status ─────────────────────
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "accepted", "in_progress", "awaiting_approval", "completed", "disputed", "cancelled"];
    if (!validStatuses.includes(status)) {
      sendError(res, "Invalid status value.", 400);
      return;
    }

    const booking = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("client", "name email").populate({ path: "worker", populate: { path: "user", select: "name email" } });

    if (!booking) { sendError(res, "Booking not found.", 404); return; }
    sendSuccess(res, "Booking status updated.", booking);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update booking status.";
    sendError(res, message, 500);
  }
};
