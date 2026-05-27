import mongoose, { Schema } from "mongoose";
import { IWorker } from "../types";

const WorkerSchema = new Schema<IWorker>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    experience: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "Kerala",
    },
    pincode: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalJobs: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isElite: {
      type: Boolean,
      default: false,
    },
    idProof: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Worker = mongoose.model<IWorker>("Worker", WorkerSchema);
export default Worker;
