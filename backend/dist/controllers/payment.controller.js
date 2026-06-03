"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const response_utils_1 = require("../utils/response.utils");
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "dummy_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});
/**
 * @desc Create a Razorpay Order
 * @route POST /api/payment/create-order
 * @access Private (Client)
 */
const createOrder = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.user.id;
        if (!jobId) {
            (0, response_utils_1.sendError)(res, "Job ID is required.", 400);
            return;
        }
        const job = await Booking_model_1.default.findById(jobId);
        if (!job) {
            (0, response_utils_1.sendError)(res, "Job not found.", 404);
            return;
        }
        // Verify it's the client's job
        if (job.client.toString() !== userId) {
            (0, response_utils_1.sendError)(res, "Not authorized to pay for this job.", 403);
            return;
        }
        if (job.status !== "awaiting_approval") {
            (0, response_utils_1.sendError)(res, "Job is not in awaiting_approval state.", 400);
            return;
        }
        const amount = job.actualPay || job.estimatedPay;
        if (!amount || amount <= 0) {
            (0, response_utils_1.sendError)(res, "Invalid payment amount.", 400);
            return;
        }
        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise for INR)
            currency: "INR",
            receipt: job._id.toString(),
        };
        const order = await razorpay.orders.create(options);
        // Save order id to job
        job.razorpayOrderId = order.id;
        await job.save();
        (0, response_utils_1.sendSuccess)(res, "Payment order created successfully.", { order });
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        (0, response_utils_1.sendError)(res, "Failed to create payment order.", 500);
    }
};
exports.createOrder = createOrder;
/**
 * @desc Verify a Razorpay Payment
 * @route POST /api/payment/verify
 * @access Private (Client)
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !jobId) {
            (0, response_utils_1.sendError)(res, "Missing required payment details.", 400);
            return;
        }
        const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";
        const generatedSignature = crypto_1.default
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        if (generatedSignature !== razorpay_signature) {
            (0, response_utils_1.sendError)(res, "Invalid payment signature.", 400);
            return;
        }
        const job = await Booking_model_1.default.findById(jobId);
        if (!job) {
            (0, response_utils_1.sendError)(res, "Job not found.", 404);
            return;
        }
        // Update job payment status
        job.paymentMethod = "online";
        job.paymentStatus = "paid";
        job.razorpayPaymentId = razorpay_payment_id;
        job.razorpaySignature = razorpay_signature;
        await job.save();
        (0, response_utils_1.sendSuccess)(res, "Payment verified successfully.");
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        (0, response_utils_1.sendError)(res, "Failed to verify payment.", 500);
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=payment.controller.js.map