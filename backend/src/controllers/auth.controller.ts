import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response.utils";
import { AuthRequest, UserRole } from "../types";
import User from "../models/User.model";


// ── Validation Schemas ───────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "worker"]).default("client"),
  phone: z.string().optional(),
  // Worker-specific optional fields
  category: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  hourlyRate: z.number().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const sendSignupOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});



const googleLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ── Cookie Options ───────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── POST /api/auth/register ──────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.errors[0].message, 400);
      return;
    }
    const {
      name, email, password, role, phone,
      category, bio, experience, hourlyRate, location, city, state, pincode, address, skills
    } = parsed.data;

    const result = await authService.registerUser(
      name,
      email,
      password,
      role as UserRole,
      phone,
      { category, bio, experience, hourlyRate, location, city, state, pincode, skills },
      city,
      address,
      state,
      pincode
    );

    // We set the cookie and log the user in immediately since they passed OTP validation before calling register.
    res.cookie("token", result.token, cookieOptions);
    res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
    sendSuccess(res, "Registration successful.", result, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    sendError(res, message, 400);
  }
};

// ── POST /api/auth/verify-otp ────────────────────────────────
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = verifyOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.errors[0].message, 400);
      return;
    }
    const { email, otp } = parsed.data;
    const result = await authService.verifySignupOTP(email, otp);

    sendSuccess(res, "Verification successful.", result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    sendError(res, message, 400);
  }
};

// ── POST /api/auth/send-signup-otp ───────────────────────────
export const sendSignupOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = sendSignupOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.errors[0].message, 400);
      return;
    }
    const { email } = parsed.data;
    const result = await authService.sendSignupOTP(email);

    sendSuccess(res, result.message, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Resend OTP failed.";
    sendError(res, message, 400);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.errors[0].message, 400);
      return;
    }
    const { email, password } = parsed.data;
    const result = await authService.loginUser(email, password);

    res.cookie("token", result.token, cookieOptions);
    res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
    sendSuccess(res, "Login successful.", result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed.";
    sendError(res, message, 401);
  }
};

// ── POST /api/auth/google ────────────────────────────────────
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = googleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, parsed.error.errors[0].message, 400);
      return;
    }
    const { email } = parsed.data;
    const result = await authService.googleLogin(email);

    res.cookie("token", result.token, cookieOptions);
    res.cookie("user_role", result.user.role, { ...cookieOptions, httpOnly: false });
    sendSuccess(res, "Google login successful.", result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Google login failed.";
    // Send 404 so the frontend knows the user is not registered
    sendError(res, message, 404);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, "User fetched successfully.", user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch user.";
    sendError(res, message, 404);
  }
};

// ── PATCH /api/auth/profile ──────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { avatar } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) { sendError(res, "User not found.", 404); return; }
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    sendSuccess(res, "Profile updated.", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      city: user.city,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    sendError(res, message, 500);
  }
};

// ── POST /api/auth/logout ────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token");
  res.clearCookie("user_role");
  sendSuccess(res, "Logged out successfully.");
};
