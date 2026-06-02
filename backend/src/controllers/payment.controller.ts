import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Job from "../models/Booking.model";
import { sendSuccess, sendError } from "../utils/response.utils";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "dummy_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

/**
 * @desc Create a Razorpay Order
 * @route POST /api/payment/create-order
 * @access Private (Client)
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.body;
    const userId = (req as any).user.id;

    if (!jobId) {
      sendError(res, "Job ID is required.", 400);
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      sendError(res, "Job not found.", 404);
      return;
    }

    // Verify it's the client's job
    if (job.client.toString() !== userId) {
      sendError(res, "Not authorized to pay for this job.", 403);
      return;
    }

    if (job.status !== "awaiting_approval") {
      sendError(res, "Job is not in awaiting_approval state.", 400);
      return;
    }

    const amount = job.actualPay || job.estimatedPay;

    if (!amount || amount <= 0) {
      sendError(res, "Invalid payment amount.", 400);
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

    sendSuccess(res, "Payment order created successfully.", { order });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    sendError(res, "Failed to create payment order.", 500);
  }
};

/**
 * @desc Verify a Razorpay Payment
 * @route POST /api/payment/verify
 * @access Private (Client)
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !jobId) {
      sendError(res, "Missing required payment details.", 400);
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      sendError(res, "Invalid payment signature.", 400);
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      sendError(res, "Job not found.", 404);
      return;
    }

    // Update job payment status
    job.paymentMethod = "online";
    job.paymentStatus = "paid";
    job.razorpayPaymentId = razorpay_payment_id;
    job.razorpaySignature = razorpay_signature;
    await job.save();

    sendSuccess(res, "Payment verified successfully.");
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    sendError(res, "Failed to verify payment.", 500);
  }
};
