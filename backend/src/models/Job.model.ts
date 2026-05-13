import mongoose, { Schema } from "mongoose";
import { IJob } from "../types";

const JobSchema = new Schema<IJob>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    estimatedPay: {
      type: Number,
      required: true,
    },
    actualPay: {
      type: Number,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;
