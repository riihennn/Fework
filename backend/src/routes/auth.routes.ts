import { Router } from "express";
import { register, login, googleLogin, getMe, logout, updateProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);

// Protected routes
router.get("/me", requireAuth, getMe as any);
router.patch("/profile", requireAuth, updateProfile as any);

export default router;
