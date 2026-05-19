import User from "../models/User.model";
import Worker from "../models/Worker.model";
import { signToken } from "../utils/jwt.utils";
import { IUser, UserRole } from "../types";

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
}

// ── Register ────────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  phone?: string,
  workerProfile?: WorkerProfileInput,
  city?: string
): Promise<{ user: Partial<IUser>; token: string }> => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("An account with this email already exists.");

  const user = await User.create({ name, email, password, role, phone, city: city || "" });

  // If registering as a worker, create their professional profile
  if (role === "worker") {
    await Worker.create({
      user: user._id,
      category: workerProfile?.category || "",
      bio: workerProfile?.bio || "",
      experience: workerProfile?.experience || "",
      hourlyRate: workerProfile?.hourlyRate || 0,
      location: workerProfile?.location || "",
      city: workerProfile?.city || "",
      state: workerProfile?.state || "",
      pincode: workerProfile?.pincode || "",
    });
  }

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
