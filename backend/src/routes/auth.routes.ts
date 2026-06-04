import { Router } from "express";
import { register, login, googleLogin, getMe, logout, updateProfile, changePassword, verifyOTP, sendSignupOTP } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: { success: false, message: "Too many requests, please try again later." }
});

// Public routes
router.post("/register", authLimiter, register);
router.post("/verify-signup-otp", authLimiter, verifyOTP);
router.post("/send-signup-otp", authLimiter, sendSignupOTP);
router.post("/login", authLimiter, login);
router.post("/google", googleLogin);
router.post("/logout", logout);

// Protected routes
router.get("/me", requireAuth, getMe as any);
router.patch("/profile", requireAuth, updateProfile as any);
router.patch("/change-password", requireAuth, changePassword as any);

export default router;
