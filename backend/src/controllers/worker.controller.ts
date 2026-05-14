import { Request, Response, NextFunction } from "express";
import Worker from "../models/Worker.model";
import User from "../models/User.model";
import Job from "../models/Booking.model";
import { AuthRequest } from "../types";
import { sendSuccess } from "../utils/response.utils";

/**
 * @desc    Get all workers (public)
 * @route   GET /api/workers
 * @access  Public
 */
export const getAllWorkers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = (req.query.search as string)?.trim();
    const city = (req.query.city as string)?.trim();
    const { category, sort, isAvailable, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    const query: any = {};

    // 1. Filter by category
    if (category && category !== "All") {
      query.category = category as string;
    }

    // 2. Filter by city
    if (city) {
      query.city = { $regex: city as string, $options: "i" };
    }

    // 3. Filter by availability (default true for public view)
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    } else {
      query.isAvailable = true; // Only show active workers by default
    }

    // 4. Handle Search (Keyword in name, category, or bio)
    if (search) {
      const keyword = search as string;
      
      // 4.1 Find users with matching names first
      const matchingUsers = await User.find({
        name: { $regex: keyword, $options: "i" }
      }).select("_id");
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { user: { $in: userIds } },
        { category: { $regex: keyword, $options: "i" } },
        { bio: { $regex: keyword, $options: "i" } },
        { city: { $regex: keyword, $options: "i" } } // Include city in general search too
      ];
    }

    // 5. Initial worker fetch with population
    let workersQuery = Worker.find(query).populate("user", "name email avatar");

    // 6. Handle Sorting
    if (sort) {
      const sortBy = (sort as string).split(",").join(" ");
      workersQuery = workersQuery.sort(sortBy);
    } else {
      workersQuery = workersQuery.sort("-rating"); // Default sort by rating
    }

    // 7. Apply Pagination
    const workers = await workersQuery
      .skip(skip)
      .limit(limitNum);

    const total = await Worker.countDocuments(query);

    sendSuccess(res, "Workers retrieved successfully", {
      workers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single worker by ID
 * @route   GET /api/workers/:id
 * @access  Public
 */
export const getWorkerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      "user",
      "name email avatar phone"
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    sendSuccess(res, "Worker retrieved successfully", worker);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle worker availability
 * @route   PUT /api/workers/availability
 * @access  Private (Worker only)
 */
export const toggleAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findOne({ user: req.user?.id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    const currentStatus = worker.isAvailable;

    // If trying to go OFFLINE (current is true, target is false)
    if (currentStatus === true) {
      const activeJobs = await Job.findOne({
        worker: worker._id,
        status: { $in: ["pending", "accepted", "in_progress", "awaiting_approval", "disputed"] },
      });

      if (activeJobs) {
        return res.status(400).json({
          success: false,
          message: "Cannot go offline while you have request active or pending jobs. Please complete or resolve them first.",
        });
      }
    }

    worker.isAvailable = !worker.isAvailable;
    await worker.save();

    sendSuccess(res, "Availability updated", {
      isAvailable: worker.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get worker dashboard data (stats & recent jobs)
 * @route   GET /api/workers/dashboard
 * @access  Private (Worker only)
 */
export const getWorkerDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findOne({ user: req.user?.id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    // 1. Fetch Stats
    const completedJobs = await Job.find({ 
      worker: worker._id, 
      status: "completed" 
    });

    const totalEarnings = completedJobs.reduce((acc, job) => acc + (job.actualPay || job.estimatedPay), 0);
    
    // 2. Fetch Recent Activity (last 5 jobs)
    const recentJobs = await Job.find({ worker: worker._id })
      .populate("client", "name email avatar")
      .sort("-createdAt")
      .limit(5);

    // 3. Calculate Performance Metrics
    const totalFields = 8; // category, bio, hourlyRate, experience, location, city, state, pincode
    const filledFields = [
      worker.category, worker.bio, worker.hourlyRate, worker.experience, 
      worker.location, worker.city, worker.state, worker.pincode
    ].filter(f => !!f).length;
    
    const profileCompletion = Math.round((filledFields / totalFields) * 100);

    // 4. Construct response
    const dashboardData = {
      stats: {
        totalEarnings,
        jobsCompleted: worker.totalJobs,
        rating: worker.rating,
        responseRate: 98,
        isAvailable: worker.isAvailable,
      },
      performance: {
        profileCompletion,
        clientSatisfaction: worker.rating ? (worker.rating / 5) * 100 : 0,
        onTimeArrival: 95, // Mock for now
      },
      recentJobs: recentJobs.map(job => ({
        id: job._id,
        client: (job.client as any)?.name || "Unknown Client",
        service: job.service,
        location: job.location,
        date: job.scheduledAt,
        status: job.status,
        amount: job.status === "completed" ? (job.actualPay || job.estimatedPay) : job.estimatedPay,
      })),
    };

    sendSuccess(res, "Dashboard data retrieved", dashboardData);
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get earnings breakdown for the logged-in worker
 * @route   GET /api/workers/earnings
 * @access  Private (Worker only)
 */
export const getWorkerEarnings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findOne({ user: req.user?.id });
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

    const completedJobs = await Job.find({ worker: worker._id, status: "completed" })
      .populate("client", "name email avatar")
      .sort("-updatedAt");

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate earnings
    let totalEarnings = 0;
    let thisWeek = 0;
    let thisMonth = 0;

    // Monthly breakdown — last 6 months
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyMap[key] = 0;
    }

    completedJobs.forEach((job) => {
      const pay = job.actualPay || job.estimatedPay;
      const paidAt = job.updatedAt as Date;

      totalEarnings += pay;
      if (paidAt >= startOfWeek) thisWeek += pay;
      if (paidAt >= startOfMonth) thisMonth += pay;

      const key = paidAt.toLocaleString("default", { month: "short", year: "2-digit" });
      if (key in monthlyMap) monthlyMap[key] += pay;
    });

    // Pending earnings (awaiting_approval jobs)
    const pendingJobs = await Job.find({ worker: worker._id, status: "awaiting_approval" });
    const pendingEarnings = pendingJobs.reduce((acc, j) => acc + (j.actualPay || j.estimatedPay), 0);

    sendSuccess(res, "Earnings retrieved", {
      summary: {
        totalEarnings,
        thisMonth,
        thisWeek,
        pendingEarnings,
        totalJobs: completedJobs.length,
        avgPerJob: completedJobs.length ? Math.round(totalEarnings / completedJobs.length) : 0,
      },
      monthlyBreakdown: Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount })),
      recentTransactions: completedJobs.slice(0, 20).map((job) => ({
        id: job._id,
        service: job.service,
        client: (job.client as any)?.name || "Client",
        clientAvatar: (job.client as any)?.avatar,
        amount: job.actualPay || job.estimatedPay,
        paidAt: job.updatedAt,
        location: job.location,
      })),
    });
  } catch (error) {
    next(error);
  }
};
