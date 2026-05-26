import { Router } from "express";
import { getMessages, clearChat, clearAllChats } from "../controllers/message.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// DELETE /api/messages/all - Clear all chats for the current user
router.delete("/all", requireAuth, clearAllChats);

// GET /api/messages/:jobId - Get message history for a job
router.get("/:jobId", requireAuth, getMessages);

// DELETE /api/messages/:jobId - Clear message history for a job
router.delete("/:jobId", requireAuth, clearChat);

export default router;
