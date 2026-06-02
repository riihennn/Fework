"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAssignRevisit = exports.deleteTicket = exports.adminResolveTicket = exports.updateTicketStatus = exports.getTicketDetails = exports.getAdminTickets = exports.getUserTickets = exports.createTicket = void 0;
const Ticket_model_1 = __importDefault(require("../models/Ticket.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const response_utils_1 = require("../utils/response.utils");
const app_1 = require("../app");
// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { bookingId, issueType, title, description, evidenceImages } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId) {
            (0, response_utils_1.sendError)(res, "User not authenticated", 401);
            return;
        }
        let booking;
        if (bookingId) {
            // Verify booking exists
            booking = await Booking_model_1.default.findById(bookingId);
            if (!booking) {
                (0, response_utils_1.sendError)(res, "Booking not found", 404);
                return;
            }
        }
        const ticket = await Ticket_model_1.default.create({
            user: userId,
            booking: bookingId,
            role: userRole,
            issueType,
            title,
            description,
            evidenceImages: evidenceImages || [],
            status: "OPEN",
        });
        (0, response_utils_1.sendSuccess)(res, "Ticket created successfully.", { ticket }, 201);
    }
    catch (error) {
        console.error("[createTicket] Error:", error.message);
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.createTicket = createTicket;
// @desc    Get user's tickets
// @route   GET /api/tickets/my
// @access  Private
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await Ticket_model_1.default.find({ user: userId })
            .populate("booking", "service location scheduledAt")
            .sort("-createdAt");
        (0, response_utils_1.sendSuccess)(res, "Tickets fetched successfully.", { tickets });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.getUserTickets = getUserTickets;
// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
const getAdminTickets = async (req, res) => {
    try {
        const tickets = await Ticket_model_1.default.find()
            .populate("user", "name email avatar")
            .populate("booking", "service location scheduledAt")
            .sort("-createdAt");
        (0, response_utils_1.sendSuccess)(res, "Tickets fetched successfully.", { tickets });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.getAdminTickets = getAdminTickets;
// @desc    Get single ticket details
// @route   GET /api/tickets/:id
// @access  Private
const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket_model_1.default.findById(id)
            .populate("user", "name email avatar")
            .populate({
            path: "booking",
            populate: [
                { path: "client", select: "name email avatar phone" },
                { path: "worker", select: "name email avatar phone" }
            ]
        });
        if (!ticket) {
            (0, response_utils_1.sendError)(res, "Ticket not found", 404);
            return;
        }
        (0, response_utils_1.sendSuccess)(res, "Ticket details fetched.", { ticket });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.getTicketDetails = getTicketDetails;
// @desc    Update ticket status
// @route   PUT /api/tickets/:id (or PATCH /api/tickets/:id/status)
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await Ticket_model_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!ticket) {
            (0, response_utils_1.sendError)(res, "Ticket not found", 404);
            return;
        }
        // Notify the ticket owner (reporter) about the status update
        if (ticket.user) {
            app_1.socketService.emitToRoom(`user_${ticket.user}`, "ticket_updated", { ticketId: ticket._id, status: ticket.status });
        }
        (0, response_utils_1.sendSuccess)(res, "Ticket status updated.", { ticket });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.updateTicketStatus = updateTicketStatus;
// @desc    Admin resolve ticket
// @route   PATCH /api/tickets/:id/respond
// @access  Private/Admin
const adminResolveTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes, resolution, status } = req.body;
        const ticket = await Ticket_model_1.default.findByIdAndUpdate(id, {
            adminNotes,
            resolution,
            status: status || "RESOLVED",
            resolvedAt: new Date()
        }, { new: true, runValidators: true });
        if (!ticket) {
            (0, response_utils_1.sendError)(res, "Ticket not found", 404);
            return;
        }
        if (ticket.user) {
            app_1.socketService.emitToRoom(`user_${ticket.user}`, "ticket_updated", { ticketId: ticket._id, status: ticket.status });
        }
        (0, response_utils_1.sendSuccess)(res, "Ticket resolved successfully.", { ticket });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.adminResolveTicket = adminResolveTicket;
// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket_model_1.default.findByIdAndDelete(id);
        if (!ticket) {
            (0, response_utils_1.sendError)(res, "Ticket not found", 404);
            return;
        }
        (0, response_utils_1.sendSuccess)(res, "Ticket deleted successfully.");
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.deleteTicket = deleteTicket;
// @desc    Admin assign revisit (priority rework)
// @route   POST /api/tickets/:id/revisit
// @access  Private/Admin
const adminAssignRevisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledAt, estimatedPay = 0 } = req.body;
        const ticket = await Ticket_model_1.default.findById(id).populate("booking");
        if (!ticket) {
            (0, response_utils_1.sendError)(res, "Ticket not found", 404);
            return;
        }
        if (!ticket.booking) {
            (0, response_utils_1.sendError)(res, "Ticket does not have an associated booking", 400);
            return;
        }
        const originalBooking = ticket.booking;
        // Create a new "Revisit" booking
        const newBooking = await Booking_model_1.default.create({
            client: originalBooking.client,
            worker: originalBooking.worker,
            service: `[REVISIT] ${originalBooking.service}`,
            description: `Priority rework/revisit based on Support Ticket TKT-${ticket._id.toString().slice(-6).toUpperCase()}. \nOriginal issue: ${ticket.title}\nDetails: ${ticket.description}`,
            location: originalBooking.location,
            status: "accepted", // Auto accept
            scheduledAt: scheduledAt || new Date(Date.now() + 2 * 60 * 60 * 1000), // Default to 2 hours from now
            estimatedPay: estimatedPay,
            isUrgent: true,
            isRevisit: true,
            revisitFor: originalBooking._id,
        });
        // Resolve the ticket
        ticket.status = "RESOLVED";
        ticket.adminNotes = (ticket.adminNotes ? ticket.adminNotes + "\n\n" : "") + "Admin assigned a priority revisit job for the worker.";
        ticket.resolution = `A priority revisit has been scheduled for ${new Date(newBooking.scheduledAt).toLocaleString()}. The worker has been instructed to fix the issue.`;
        ticket.resolvedAt = new Date();
        await ticket.save();
        // Notify the worker of the new booking
        app_1.socketService.emitToRoom(`user_${originalBooking.worker}`, "new_booking", { job: newBooking });
        // Notify the client that their ticket was resolved
        app_1.socketService.emitToRoom(`user_${originalBooking.client}`, "ticket_updated", { ticketId: ticket._id, status: "RESOLVED" });
        (0, response_utils_1.sendSuccess)(res, "Priority revisit assigned and ticket resolved.", { ticket, newBooking });
    }
    catch (error) {
        (0, response_utils_1.sendError)(res, error.message, 500);
    }
};
exports.adminAssignRevisit = adminAssignRevisit;
//# sourceMappingURL=ticket.controller.js.map