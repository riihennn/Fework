import { Request, Response, NextFunction } from "express";
import Worker from "../models/Worker.model";
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
    const { category, city, search, sort, isAvailable } = req.query;

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

    // 3. Filter by availability (default true for public view if not specified)
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    }

    // 4. Initial worker fetch with population
    let workersQuery = Worker.find(query).populate("user", "name email avatar");

    // 5. Handle Sorting
    if (sort) {
      const sortBy = (sort as string).split(",").join(" ");
      workersQuery = workersQuery.sort(sortBy);
    } else {
      workersQuery = workersQuery.sort("-rating"); // Default sort by rating
    }

    let workers = await workersQuery;

    // 6. Handle Search (Keyword in name or category)
    if (search) {
      const keyword = (search as string).toLowerCase();
      workers = workers.filter((w: any) => {
        const nameMatch = w.user?.name?.toLowerCase().includes(keyword);
        const categoryMatch = w.category?.toLowerCase().includes(keyword);
        return nameMatch || categoryMatch;
      });
    }

    sendSuccess(res, "Workers retrieved successfully", workers);
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

    worker.isAvailable = !worker.isAvailable;
    await worker.save();

    sendSuccess(res, "Availability updated", {
      isAvailable: worker.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};
