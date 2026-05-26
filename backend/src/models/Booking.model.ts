import mongoose, { Schema } from "mongoose";
import { IJob } from "../types";

const JobSchema = new Schema<IJob>(
  {
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    service: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "awaiting_approval", "completed", "disputed", "cancelled"],
      default: "pending",
    },
    scheduledAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    estimatedPay: { type: Number, required: true },
    actualPay: { type: Number },
    isUrgent: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["cash"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    workerNote: { type: String, trim: true },
    clientApproval: {
      approved: { type: Boolean },
      note: { type: String, trim: true },
      approvedAt: { type: Date },
    },
    reviewed: { type: Boolean, default: false },
    rescheduledCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;
