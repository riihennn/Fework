import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  role: "client" | "worker";
  issueType: "Worker Didn't Arrive" | "Work Not Completed" | "Poor Service Quality" | "Payment Issue" | "Booking Cancellation" | "Worker Misconduct" | "Client Misconduct" | "Safety Concern" | "App Issue" | "Other";
  title: string;
  description: string;
  evidenceImages: string[];
  status: "OPEN" | "IN_REVIEW" | "WAITING_FOR_RESPONSE" | "RESOLVED" | "REJECTED" | "CLOSED";
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Job", required: false },
    role: { type: String, enum: ["client", "worker"], required: true },
    issueType: {
      type: String,
      enum: [
        "Worker Didn't Arrive", 
        "Work Not Completed", 
        "Poor Service Quality", 
        "Payment Issue", 
        "Booking Cancellation", 
        "Worker Misconduct", 
        "Client Misconduct", 
        "Safety Concern", 
        "App Issue",
        "Other"
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidenceImages: [{ type: String }],
    status: {
      type: String,
      enum: ["OPEN", "IN_REVIEW", "WAITING_FOR_RESPONSE", "RESOLVED", "REJECTED", "CLOSED"],
      default: "OPEN",
    },
    adminNotes: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
