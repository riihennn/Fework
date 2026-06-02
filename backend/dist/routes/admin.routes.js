"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"));
// ── Stats ──────────────────────────────────────────────────────
router.get("/stats", admin_controller_1.getStats);
// ── Users ──────────────────────────────────────────────────────
router.get("/users", admin_controller_1.getUsers);
router.delete("/users/:id", admin_controller_1.deleteUser);
router.patch("/users/:id/block", admin_controller_1.toggleBlockUser);
// ── Workers ────────────────────────────────────────────────────
router.get("/workers", admin_controller_1.getWorkers);
router.get("/workers/:id", admin_controller_1.getWorkerById);
router.patch("/workers/:id/elite", admin_controller_1.toggleElite);
router.patch("/workers/:id/verify", admin_controller_1.verifyWorker);
// ── Bookings ───────────────────────────────────────────────────
router.get("/bookings", admin_controller_1.getBookings);
router.patch("/bookings/:id/status", admin_controller_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map