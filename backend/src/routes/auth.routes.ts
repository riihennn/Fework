import { Router } from "express";
import { register, login, googleLogin, getMe, logout, updateProfile, changePassword, verifyOTP, sendSignupOTP } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/verify-signup-otp", verifyOTP);
router.post("/send-signup-otp", sendSignupOTP);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);

// Protected routes
router.get("/me", requireAuth, getMe as any);
router.patch("/profile", requireAuth, updateProfile as any);
router.patch("/change-password", requireAuth, changePassword as any);

export default router;
