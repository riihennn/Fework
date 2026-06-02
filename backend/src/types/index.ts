import { Request } from "express";
import { Document, Types } from "mongoose";

// ─── User Roles ───────────────────────────────────────────────
export type UserRole = "client" | "worker" | "admin";

// ─── User Document ────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  address?: string;
  state?: string;
  pincode?: string;
  isVerified: boolean;
  isBlocked: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Worker Document ──────────────────────────────────────────
export interface IWorker extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  category: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  experience: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  isElite: boolean;
  idProof?: string;
  verificationStatus: "pending" | "approved" | "rejected";
}

// ─── Job Document ─────────────────────────────────────────────
export type JobStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "awaiting_approval"   // worker done, waiting for client to confirm
  | "completed"
  | "disputed"            // client raised an issue
  | "cancelled";

export interface IJobClientApproval {
  approved: boolean;
  note?: string;
  approvedAt?: Date;
}

export interface IJob extends Document {
  _id: Types.ObjectId;
  client: Types.ObjectId;
  worker: Types.ObjectId;
  service: string;
  description: string;
  location: string;
  status: JobStatus;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  estimatedPay: number;
  actualPay?: number;
  isUrgent: boolean;
  isRevisit: boolean;
  revisitFor?: Types.ObjectId;
  paymentMethod: "cash" | "online";
  paymentStatus: "pending" | "paid";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  clientApproval?: IJobClientApproval;
  workerNote?: string;
  reviewed: boolean;
  rescheduledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Review Document ──────────────────────────────────────────
export interface IReview extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  client: Types.ObjectId;
  worker: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ─── Authenticated Request ────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// ─── API Response shape ───────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
