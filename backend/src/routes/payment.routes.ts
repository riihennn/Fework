import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// ── Client Payment Routes ─────────────────────────────────────────────
router.post("/create-order", requireAuth, requireRole("client"), createOrder);
router.post("/verify", requireAuth, requireRole("client"), verifyPayment);

export default router;
