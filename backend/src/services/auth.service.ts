import User from "../models/User.model";
import Worker from "../models/Worker.model";
import Otp from "../models/Otp.model";
import { signToken } from "../utils/jwt.utils";
import { IUser, UserRole } from "../types";
import { sendOTPEmail } from "../utils/email.utils";

// ── Generate OTP ─────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


// ─── Worker Profile Input ────────────────────────────────────
export interface WorkerProfileInput {
  category?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  skills?: string[];
}

// ── Pre-Registration OTP Flow ────────────────────────────────
export const sendSignupOTP = async (email: string): Promise<{ message: string, otp?: string }> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("An account with this email already exists.");

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Upsert OTP record
  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt, verified: false },
    { upsert: true, new: true }
  );

  await sendOTPEmail({ to: email, otp });

  return { 
    message: "An OTP has been sent to your email address."
  };
};

export const verifySignupOTP = async (email: string, otpCode: string): Promise<{ message: string }> => {
  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) throw new Error("No OTP requested for this email.");
  
  if (otpRecord.expiresAt < new Date()) throw new Error("OTP has expired. Please request a new one.");
  if (otpRecord.otp !== otpCode) throw new Error("Invalid OTP.");

  otpRecord.verified = true;
  await otpRecord.save();

  return { message: "Email verified successfully." };
};

// ── Register ────────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  phone?: string,
  workerProfile?: WorkerProfileInput,
  city?: string,
  address?: string,
  state?: string,
  pincode?: string
): Promise<{ user: Partial<IUser>; token: string }> => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("An account with this email already exists.");

  // Check if email was verified (except for Google auth which we handle differently, or if we bypass it.
  // Actually, Google Auth bypassed the OTP step in frontend, but here we require it.
  // Wait, the frontend sends "GOOGLE_AUTH_PLACEHOLDER_PASS" if Google Auth. 
  // Let's assume Google Auth is bypassed via controller, or we just verify OTP if they didn't do google login?
  // Let's check OTP unconditionally for now, or bypass if it's the placeholder pass?
  // Better: check if an OTP was verified for this email.
  if (password !== "GOOGLE_AUTH_PLACEHOLDER_PASS") {
    const otpRecord = await Otp.findOne({ email, verified: true });
    if (!otpRecord) {
      throw new Error("Email has not been verified. Please verify OTP first.");
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    // Only store address in User for CLIENT role.
    // For workers, address lives exclusively in the Worker collection.
    city:    role !== "worker" ? (city    || "") : "",
    address: role !== "worker" ? (address || "") : "",
    state:   role !== "worker" ? (state   || "") : "",
    pincode: role !== "worker" ? (pincode || "") : "",
    isVerified: true,
  });

  // If registering as a worker, create their professional profile
  if (role === "worker") {
    await Worker.create({
      user: user._id,
      category: workerProfile?.category || "",
      bio: workerProfile?.bio || "",
      skills: workerProfile?.skills || [],
      experience: workerProfile?.experience || "",
      hourlyRate: workerProfile?.hourlyRate || 0,
      location: workerProfile?.location || "",
      city: workerProfile?.city || "",
      state: workerProfile?.state || "",
      pincode: workerProfile?.pincode || "",
    });
  }

  // Clean up OTP record
  await Otp.deleteOne({ email });

  const token = signToken({ id: user._id.toString(), role: user.role });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      city: user.city,
      address: user.address,
      state: user.state,
      pincode: user.pincode,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Partial<IUser>; token: string }> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid email or password.");

  if (user.isBlocked) throw new Error("Your account has been blocked by the admin.");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid email or password.");

  const token = signToken({ id: user._id.toString(), role: user.role });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      city: user.city,
      isVerified: user.isVerified,
    },
    token,
  };
};

export const googleLogin = async (
  email: string
): Promise<{ user: Partial<IUser>; token: string }> => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not registered.");

  if (user.isBlocked) throw new Error("Your account has been blocked by the admin.");

  const token = signToken({ id: user._id.toString(), role: user.role });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      city: user.city,
      isVerified: user.isVerified,
    },
    token,
  };
};

// ── Get current user ─────────────────────────────────────────
export const getMe = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");
  if (user.isBlocked) throw new Error("Your account has been blocked by the admin.");
  return user;
};
