import { Router } from "express";
import { submitReview, getWorkerReviews, checkReviewed, getMyReviews } from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/", requireAuth, requireRole("client"), submitReview);
router.get("/mine", requireAuth, requireRole("worker"), getMyReviews);
router.get("/worker/:workerId", getWorkerReviews);
router.get("/check/:jobId", requireAuth, requireRole("client"), checkReviewed);

export default router;
