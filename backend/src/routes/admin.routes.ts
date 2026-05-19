import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  getStats,
  getUsers,
  deleteUser,
  toggleBlockUser,
  getWorkers,
  toggleElite,
  getBookings,
  updateBookingStatus,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireRole("admin"));

// ── Stats ──────────────────────────────────────────────────────
router.get("/stats", getStats);

// ── Users ──────────────────────────────────────────────────────
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/block", toggleBlockUser);

// ── Workers ────────────────────────────────────────────────────
router.get("/workers", getWorkers);
router.patch("/workers/:id/elite", toggleElite);

// ── Bookings ───────────────────────────────────────────────────
router.get("/bookings", getBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

export default router;
