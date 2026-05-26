import { Router } from "express";
import { getMessages } from "../controllers/message.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// GET /api/messages/:jobId - Get message history for a job
router.get("/:jobId", requireAuth, getMessages);

export default router;
