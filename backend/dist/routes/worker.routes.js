"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const worker_controller_1 = require("../controllers/worker.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.get("/", worker_controller_1.getAllWorkers);
router.get("/dashboard", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), worker_controller_1.getWorkerDashboard);
router.get("/earnings", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), worker_controller_1.getWorkerEarnings);
router.get("/me", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), worker_controller_1.getMyWorkerProfile);
router.get("/:id", worker_controller_1.getWorkerById);
router.put("/availability", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), worker_controller_1.toggleAvailability);
router.patch("/profile", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("worker"), worker_controller_1.updateWorkerProfile);
exports.default = router;
//# sourceMappingURL=worker.routes.js.map