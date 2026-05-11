import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response.utils";
import { AuthRequest, UserRole } from "../types";

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
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
      category, bio, experience, hourlyRate, location, city, state, pincode
    } = parsed.data;

    const result = await authService.registerUser(
      name, email, password, role as UserRole, phone,
      { category, bio, experience, hourlyRate, location, city, state, pincode }
    );

    res.cookie("token", result.token, cookieOptions);
    sendSuccess(res, "Registration successful.", result, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
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
    sendSuccess(res, "Login successful.", result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed.";
    sendError(res, message, 401);
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

// ── POST /api/auth/logout ────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token");
  sendSuccess(res, "Logged out successfully.");
};
