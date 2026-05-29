import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  createTicket,
  getUserTickets,
  getAdminTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketDetails,
  adminResolveTicket,
  adminAssignRevisit
} from "../controllers/ticket.controller";

const router = Router();

// Routes for clients and workers
router.post("/", requireAuth, createTicket);
router.get("/my", requireAuth, getUserTickets);
router.get("/:id", requireAuth, getTicketDetails);

// Routes for admins
router.get("/", requireAuth, requireRole("admin"), getAdminTickets);
router.put("/:id", requireAuth, requireRole("admin"), updateTicketStatus);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateTicketStatus);
router.patch("/:id/respond", requireAuth, requireRole("admin"), adminResolveTicket);
router.post("/:id/revisit", requireAuth, requireRole("admin"), adminAssignRevisit);
router.delete("/:id", requireAuth, requireRole("admin"), deleteTicket);

export default router;
