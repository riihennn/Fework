import { Response, NextFunction } from "express";
import Review from "../models/Review.model";
import Worker from "../models/Worker.model";
import Job from "../models/Booking.model";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response.utils";

/**
 * @desc    Client submits a review after job completion
 * @route   POST /api/reviews
 * @access  Private (Client only)
 */
export const submitReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, rating, comment } = req.body;

    if (!jobId || !rating) {
      return sendError(res, "jobId and rating are required", 400);
    }
    if (rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    // Verify the job belongs to this client and is completed
    const job = await Job.findOne({ _id: jobId, client: req.user!.id, status: "completed" });
    if (!job) return sendError(res, "Completed job not found", 404);

    // Prevent duplicate reviews (one per job)
    const existing = await Review.findOne({ job: jobId });
    if (existing) return sendError(res, "You have already reviewed this job", 409);

    const review = await Review.create({
      job:    jobId,
      client: req.user!.id,
      worker: job.worker,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    // Mark job as reviewed
    job.reviewed = true;
    await job.save();

    // Recalculate worker's average rating
    const allReviews = await Review.find({ worker: job.worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Worker.findByIdAndUpdate(job.worker, { rating: parseFloat(avgRating.toFixed(1)) });

    sendSuccess(res, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific worker
 * @route   GET /api/reviews/worker/:workerId
 * @access  Public
 */
export const getWorkerReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workerId } = req.params;

    const reviews = await Review.find({ worker: workerId })
      .populate("client", "name avatar")
      .populate("job", "service")
      .sort("-createdAt");

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    sendSuccess(res, "Reviews retrieved", {
      reviews,
      total: reviews.length,
      avgRating: parseFloat(avgRating.toFixed(1)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if the current client has reviewed a specific job
 * @route   GET /api/reviews/check/:jobId
 * @access  Private (Client only)
 */
export const checkReviewed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const existing = await Review.findOne({ job: req.params.jobId, client: req.user!.id });
    sendSuccess(res, "Check complete", { reviewed: !!existing });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Get reviews for the currently logged-in worker
 * @route   GET /api/reviews/mine
 * @access  Private (Worker only)
 */
export const getMyReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const worker = await Worker.findOne({ user: req.user!.id });
    if (!worker) return sendError(res, "Worker not found", 404);

    const reviews = await Review.find({ worker: worker._id })
      .populate("client", "name avatar")
      .populate("job", "service")
      .sort("-createdAt");

    const total = reviews.length;
    const avgRating = total
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    // Rating breakdown: count of each star (1-5)
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

    sendSuccess(res, "My reviews retrieved", {
      reviews,
      total,
      avgRating: parseFloat(avgRating.toFixed(1)),
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};
