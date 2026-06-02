"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const router = (0, express_1.Router)();
// Routes for clients and workers
router.post("/", auth_middleware_1.requireAuth, ticket_controller_1.createTicket);
router.get("/my", auth_middleware_1.requireAuth, ticket_controller_1.getUserTickets);
router.get("/:id", auth_middleware_1.requireAuth, ticket_controller_1.getTicketDetails);
// Routes for admins
router.get("/", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.getAdminTickets);
router.put("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.updateTicketStatus);
router.patch("/:id/status", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.updateTicketStatus);
router.patch("/:id/respond", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.adminResolveTicket);
router.post("/:id/revisit", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.adminAssignRevisit);
router.delete("/:id", auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)("admin"), ticket_controller_1.deleteTicket);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map