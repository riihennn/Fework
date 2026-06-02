"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// ── Client Routes ─────────────────────────────────────────────
router.post("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), booking_controller_1.createBooking);
router.get("/client", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), booking_controller_1.getClientBookings);
// PUT /api/bookings/:jobId/approve — client approves or disputes completion
router.put("/:jobId/approve", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), booking_controller_1.approveJob);
router.put("/:jobId/cancel", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), booking_controller_1.cancelBooking);
router.put("/:jobId/reschedule", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("client"), booking_controller_1.rescheduleBooking);
// ── Worker Routes ─────────────────────────────────────────────
router.get("/stream", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), booking_controller_1.workerEventStream);
router.get("/worker", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), booking_controller_1.getWorkerBookings);
router.put("/:jobId/respond", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), booking_controller_1.respondToBooking);
router.put("/:jobId/status", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), booking_controller_1.updateJobStatus);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map