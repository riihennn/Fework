import mongoose, { Schema } from "mongoose";
import { IReview } from "../types";

const ReviewSchema = new Schema<IReview>(
  {
    job:    { type: Schema.Types.ObjectId, ref: "Job",    required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: "User",   required: true },
    worker: { type: Schema.Types.ObjectId, ref: "Worker", required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
