import { Router } from "express";
import {
  createBooking,
  respondToBooking,
  updateJobStatus,
  getWorkerBookings,
  getClientBookings,
  approveJob,
  cancelBooking,
  rescheduleBooking,
  workerEventStream,
} from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// ── Client Routes ─────────────────────────────────────────────
router.post("/", requireAuth, requireRole("client"), createBooking);
router.get("/client", requireAuth, requireRole("client"), getClientBookings);
// PUT /api/bookings/:jobId/approve — client approves or disputes completion
router.put("/:jobId/approve", requireAuth, requireRole("client"), approveJob);
router.put("/:jobId/cancel", requireAuth, requireRole("client"), cancelBooking);
router.put("/:jobId/reschedule", requireAuth, requireRole("client"), rescheduleBooking);

// ── Worker Routes ─────────────────────────────────────────────
router.get("/stream", requireAuth, requireRole("worker"), workerEventStream);
router.get("/worker", requireAuth, requireRole("worker"), getWorkerBookings);
router.put("/:jobId/respond", requireAuth, requireRole("worker"), respondToBooking);
router.put("/:jobId/status", requireAuth, requireRole("worker"), updateJobStatus);

export default router;
