"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBookings = exports.verifyWorker = exports.toggleElite = exports.getWorkerById = exports.getWorkers = exports.toggleBlockUser = exports.deleteUser = exports.getUsers = exports.getStats = void 0;
const sse_service_1 = require("../services/sse.service");
const response_utils_1 = require("../utils/response.utils");
const User_model_1 = __importDefault(require("../models/User.model"));
const Worker_model_1 = __importDefault(require("../models/Worker.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const Review_model_1 = __importDefault(require("../models/Review.model"));
// ── GET /api/admin/stats ──────────────────────────────────────
const getStats = async (_req, res) => {
    try {
        const [totalUsers, totalWorkers, totalBookings, revenueResult] = await Promise.all([
            User_model_1.default.countDocuments({ role: { $ne: "admin" } }),
            Worker_model_1.default.countDocuments(),
            Booking_model_1.default.countDocuments(),
            Booking_model_1.default.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$actualPay" } } },
            ]),
        ]);
        const [clientCount, workerCount, pendingBookings, completedBookings, cancelledBookings, disputedBookings, recentUsers, bookingsByStatus,] = await Promise.all([
            User_model_1.default.countDocuments({ role: "client" }),
            User_model_1.default.countDocuments({ role: "worker" }),
            Booking_model_1.default.countDocuments({ status: "pending" }),
            Booking_model_1.default.countDocuments({ status: "completed" }),
            Booking_model_1.default.countDocuments({ status: "cancelled" }),
            Booking_model_1.default.countDocuments({ status: "disputed" }),
            User_model_1.default.find({ role: { $ne: "admin" } })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email role avatar createdAt"),
            Booking_model_1.default.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);
        // Growth — new users in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersThisMonth = await User_model_1.default.countDocuments({
            role: { $ne: "admin" },
            createdAt: { $gte: thirtyDaysAgo },
        });
        // Trend Data for Last 7 Days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const trendJobs = await Booking_model_1.default.aggregate([
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
        (0, response_utils_1.sendSuccess)(res, "Stats fetched successfully.", {
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch stats.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.getStats = getStats;
// ── GET /api/admin/users ──────────────────────────────────────
const getUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const role = req.query.role;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const filter = { role: { $ne: "admin" } };
        if (role && ["client", "worker"].includes(role))
            filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const [users, total] = await Promise.all([
            User_model_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-password"),
            User_model_1.default.countDocuments(filter),
        ]);
        (0, response_utils_1.sendSuccess)(res, "Users fetched successfully.", {
            users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch users.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.getUsers = getUsers;
// ── DELETE /api/admin/users/:id ───────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, "User not found.", 404);
            return;
        }
        if (user.role === "admin") {
            (0, response_utils_1.sendError)(res, "Cannot delete an admin account.", 403);
            return;
        }
        await User_model_1.default.findByIdAndDelete(req.params.id);
        // Also delete worker profile if exists
        await Worker_model_1.default.findOneAndDelete({ user: req.params.id });
        (0, response_utils_1.sendSuccess)(res, "User deleted successfully.");
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete user.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.deleteUser = deleteUser;
// ── PATCH /api/admin/users/:id/block ──────────────────────────
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.params.id);
        if (!user) {
            (0, response_utils_1.sendError)(res, "User not found.", 404);
            return;
        }
        if (user.role === "admin") {
            (0, response_utils_1.sendError)(res, "Cannot block an admin account.", 403);
            return;
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        // If the blocked user is a worker, push a real-time SSE event to kick them out
        if (user.isBlocked && user.role === "worker") {
            const workerDoc = await Worker_model_1.default.findOne({ user: user._id });
            if (workerDoc) {
                sse_service_1.sseService.sendToWorker(workerDoc._id.toString(), "user_blocked", { isBlocked: true });
            }
        }
        (0, response_utils_1.sendSuccess)(res, `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`, {
            isBlocked: user.isBlocked,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to toggle block status.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.toggleBlockUser = toggleBlockUser;
// ── GET /api/admin/workers ────────────────────────────────────
const getWorkers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const search = req.query.search;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const pipeline = [
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
        if (status && status !== "all") {
            if (status === "directory") {
                pipeline.push({
                    $match: { verificationStatus: { $ne: "pending" } }
                });
            }
            else {
                pipeline.push({
                    $match: { verificationStatus: status }
                });
            }
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
                    verificationStatus: 1,
                    "userInfo.name": 1,
                    "userInfo.email": 1,
                    "userInfo.avatar": 1,
                },
            },
        ];
        const [workers, countResult] = await Promise.all([
            Worker_model_1.default.aggregate(dataPipeline),
            Worker_model_1.default.aggregate(countPipeline),
        ]);
        const total = countResult[0]?.total ?? 0;
        (0, response_utils_1.sendSuccess)(res, "Workers fetched successfully.", {
            workers,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch workers.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.getWorkers = getWorkers;
// ── GET /api/admin/workers/:id ────────────────────────────────
const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker_model_1.default.findById(req.params.id).populate("user", "-password").lean();
        if (!worker) {
            (0, response_utils_1.sendError)(res, "Worker not found.", 404);
            return;
        }
        // Fetch recent bookings for this worker
        const recentBookings = await Booking_model_1.default.find({ worker: worker._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("client", "name email avatar")
            .lean();
        // Fetch recent reviews for this worker
        const recentReviews = await Review_model_1.default.find({ worker: worker._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("client", "name email avatar")
            .lean();
        (0, response_utils_1.sendSuccess)(res, "Worker fetched successfully.", {
            worker: {
                ...worker,
                userInfo: worker.user, // normalize for frontend
            },
            recentBookings,
            recentReviews,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch worker details.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.getWorkerById = getWorkerById;
// ── PATCH /api/admin/workers/:id/elite ───────────────────────
const toggleElite = async (req, res) => {
    try {
        const worker = await Worker_model_1.default.findById(req.params.id);
        if (!worker) {
            (0, response_utils_1.sendError)(res, "Worker not found.", 404);
            return;
        }
        worker.isElite = !worker.isElite;
        await worker.save();
        (0, response_utils_1.sendSuccess)(res, `Worker ${worker.isElite ? "promoted to" : "removed from"} Elite.`, {
            isElite: worker.isElite,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to toggle elite status.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.toggleElite = toggleElite;
// ── PATCH /api/admin/workers/:id/verify ───────────────────────
const verifyWorker = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected", "pending"].includes(status)) {
            (0, response_utils_1.sendError)(res, "Invalid status.", 400);
            return;
        }
        const worker = await Worker_model_1.default.findById(req.params.id);
        if (!worker) {
            (0, response_utils_1.sendError)(res, "Worker not found.", 404);
            return;
        }
        worker.verificationStatus = status;
        await worker.save();
        // Push real-time update to the worker so their dashboard reloads
        sse_service_1.sseService.sendToWorker(worker._id.toString(), "worker_verified", { status });
        (0, response_utils_1.sendSuccess)(res, `Worker has been ${status}.`, {
            verificationStatus: worker.verificationStatus,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update verification status.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.verifyWorker = verifyWorker;
// ── GET /api/admin/bookings ───────────────────────────────────
const getBookings = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const filter = {};
        if (status && status !== "all")
            filter.status = status;
        const [bookings, total] = await Promise.all([
            Booking_model_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("client", "name email avatar")
                .populate({ path: "worker", populate: { path: "user", select: "name email avatar" } }),
            Booking_model_1.default.countDocuments(filter),
        ]);
        (0, response_utils_1.sendSuccess)(res, "Bookings fetched successfully.", {
            bookings,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch bookings.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.getBookings = getBookings;
// ── PATCH /api/admin/bookings/:id/status ─────────────────────
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "accepted", "in_progress", "awaiting_approval", "completed", "disputed", "cancelled"];
        if (!validStatuses.includes(status)) {
            (0, response_utils_1.sendError)(res, "Invalid status value.", 400);
            return;
        }
        const booking = await Booking_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("client", "name email").populate({ path: "worker", populate: { path: "user", select: "name email" } });
        if (!booking) {
            (0, response_utils_1.sendError)(res, "Booking not found.", 404);
            return;
        }
        (0, response_utils_1.sendSuccess)(res, "Booking status updated.", booking);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update booking status.";
        (0, response_utils_1.sendError)(res, message, 500);
    }
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=admin.controller.js.map