import { Router } from "express";
import {
  getAllWorkers,
  getWorkerById,
  toggleAvailability,
  getWorkerDashboard,
  getWorkerEarnings,
  updateWorkerProfile,
} from "../controllers/worker.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get("/", getAllWorkers);
router.get("/dashboard", requireAuth, requireRole("worker"), getWorkerDashboard);
router.get("/earnings", requireAuth, requireRole("worker"), getWorkerEarnings);
router.get("/:id", getWorkerById);
router.put("/availability", requireAuth, requireRole("worker"), toggleAvailability);
router.patch("/profile", requireAuth, requireRole("worker"), updateWorkerProfile);

export default router;
