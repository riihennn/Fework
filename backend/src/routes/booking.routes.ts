import { Router } from "express";
import {
  createBooking,
  respondToBooking,
  updateJobStatus,
  getWorkerBookings,
  getClientBookings,
  workerEventStream,
} from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// ── Client Routes ─────────────────────────────────────────────
// POST /api/bookings — client creates a job request
router.post("/", requireAuth, requireRole("client"), createBooking);

// GET /api/bookings/client — list of jobs requested by this client
router.get("/client", requireAuth, requireRole("client"), getClientBookings);

// ── Worker Routes ─────────────────────────────────────────────
// GET /api/bookings/stream — SSE stream for real-time events (MUST be before /:jobId)
router.get("/stream", requireAuth, requireRole("worker"), workerEventStream);

// GET /api/bookings/worker — paginated list of jobs for this worker
router.get("/worker", requireAuth, requireRole("worker"), getWorkerBookings);

// PUT /api/bookings/:jobId/respond — accept or decline a booking
router.put("/:jobId/respond", requireAuth, requireRole("worker"), respondToBooking);

// PUT /api/bookings/:jobId/status — update job lifecycle (in_progress, completed)
router.put("/:jobId/status", requireAuth, requireRole("worker"), updateJobStatus);

export default router;
