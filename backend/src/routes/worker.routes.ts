import { Router } from "express";
import {
  getAllWorkers,
  getWorkerById,
  toggleAvailability,
  getWorkerDashboard,
} from "../controllers/worker.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get("/", getAllWorkers);
router.get("/dashboard", requireAuth, requireRole("worker"), getWorkerDashboard);
router.get("/:id", getWorkerById);

router.put(
  "/availability",
  requireAuth,
  requireRole("worker"),
  toggleAvailability
);

export default router;
