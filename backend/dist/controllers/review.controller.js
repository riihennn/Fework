"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.checkReviewed = exports.getWorkerReviews = exports.submitReview = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Worker_model_1 = __importDefault(require("../models/Worker.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const response_utils_1 = require("../utils/response.utils");
/**
 * @desc    Client submits a review after job completion
 * @route   POST /api/reviews
 * @access  Private (Client only)
 */
const submitReview = async (req, res, next) => {
    try {
        const { jobId, rating, comment } = req.body;
        if (!jobId || !rating) {
            return (0, response_utils_1.sendError)(res, "jobId and rating are required", 400);
        }
        if (rating < 1 || rating > 5) {
            return (0, response_utils_1.sendError)(res, "Rating must be between 1 and 5", 400);
        }
        // Verify the job belongs to this client and is completed
        const job = await Booking_model_1.default.findOne({ _id: jobId, client: req.user.id, status: "completed" });
        if (!job)
            return (0, response_utils_1.sendError)(res, "Completed job not found", 404);
        // Prevent duplicate reviews (one per job)
        const existing = await Review_model_1.default.findOne({ job: jobId });
        if (existing)
            return (0, response_utils_1.sendError)(res, "You have already reviewed this job", 409);
        const review = await Review_model_1.default.create({
            job: jobId,
            client: req.user.id,
            worker: job.worker,
            rating: Number(rating),
            comment: comment?.trim() || "",
        });
        // Mark job as reviewed
        job.reviewed = true;
        await job.save();
        // Recalculate worker's average rating
        const allReviews = await Review_model_1.default.find({ worker: job.worker });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Worker_model_1.default.findByIdAndUpdate(job.worker, { rating: parseFloat(avgRating.toFixed(1)) });
        (0, response_utils_1.sendSuccess)(res, "Review submitted successfully", review);
    }
    catch (error) {
        next(error);
    }
};
exports.submitReview = submitReview;
/**
 * @desc    Get all reviews for a specific worker
 * @route   GET /api/reviews/worker/:workerId
 * @access  Public
 */
const getWorkerReviews = async (req, res, next) => {
    try {
        const { workerId } = req.params;
        const reviews = await Review_model_1.default.find({ worker: workerId })
            .populate("client", "name avatar")
            .populate("job", "service")
            .sort("-createdAt");
        const avgRating = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        (0, response_utils_1.sendSuccess)(res, "Reviews retrieved", {
            reviews,
            total: reviews.length,
            avgRating: parseFloat(avgRating.toFixed(1)),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkerReviews = getWorkerReviews;
/**
 * @desc    Check if the current client has reviewed a specific job
 * @route   GET /api/reviews/check/:jobId
 * @access  Private (Client only)
 */
const checkReviewed = async (req, res, next) => {
    try {
        const existing = await Review_model_1.default.findOne({ job: req.params.jobId, client: req.user.id });
        (0, response_utils_1.sendSuccess)(res, "Check complete", { reviewed: !!existing });
    }
    catch (error) {
        next(error);
    }
};
exports.checkReviewed = checkReviewed;
/**
 * @desc    Get reviews for the currently logged-in worker
 * @route   GET /api/reviews/mine
 * @access  Private (Worker only)
 */
const getMyReviews = async (req, res, next) => {
    try {
        const worker = await Worker_model_1.default.findOne({ user: req.user.id });
        if (!worker)
            return (0, response_utils_1.sendError)(res, "Worker not found", 404);
        const reviews = await Review_model_1.default.find({ worker: worker._id })
            .populate("client", "name avatar")
            .populate("job", "service")
            .sort("-createdAt");
        const total = reviews.length;
        const avgRating = total
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
            : 0;
        // Rating breakdown: count of each star (1-5)
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });
        (0, response_utils_1.sendSuccess)(res, "My reviews retrieved", {
            reviews,
            total,
            avgRating: parseFloat(avgRating.toFixed(1)),
            breakdown,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyReviews = getMyReviews;
//# sourceMappingURL=review.controller.js.map