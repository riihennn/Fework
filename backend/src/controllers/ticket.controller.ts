import { Request, Response } from "express";
import Ticket from "../models/Ticket.model";
import Booking from "../models/Booking.model";
import { sendSuccess, sendError } from "../utils/response.utils";
import { socketService } from "../app";

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, issueType, title, description, evidenceImages } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      sendError(res, "User not authenticated", 401);
      return;
    }

    let booking;
    if (bookingId) {
      // Verify booking exists
      booking = await Booking.findById(bookingId);
      if (!booking) {
        sendError(res, "Booking not found", 404);
        return;
      }
    }

    const ticket = await Ticket.create({
      user: userId,
      booking: bookingId,
      role: userRole,
      issueType,
      title,
      description,
      evidenceImages: evidenceImages || [],
      status: "OPEN",
    });

    sendSuccess(res, "Ticket created successfully.", { ticket }, 201);
  } catch (error: any) {
    console.error("[createTicket] Error:", error.message);
    sendError(res, error.message, 500);
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my
// @access  Private
export const getUserTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const tickets = await Ticket.find({ user: userId })
      .populate("booking", "service location scheduledAt")
      .sort("-createdAt");

    sendSuccess(res, "Tickets fetched successfully.", { tickets });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
export const getAdminTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email avatar")
      .populate("booking", "service location scheduledAt")
      .sort("-createdAt");

    sendSuccess(res, "Tickets fetched successfully.", { tickets });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Get single ticket details
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate("user", "name email avatar")
      .populate({
        path: "booking",
        populate: [
          { path: "client", select: "name email avatar phone" },
          { path: "worker", select: "name email avatar phone" }
        ]
      });

    if (!ticket) {
      sendError(res, "Ticket not found", 404);
      return;
    }

    sendSuccess(res, "Ticket details fetched.", { ticket });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id (or PATCH /api/tickets/:id/status)
// @access  Private/Admin
export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      sendError(res, "Ticket not found", 404);
      return;
    }

    // Notify the ticket owner (reporter) about the status update
    if (ticket.user) {
      socketService.emitToRoom(`user_${ticket.user}`, "ticket_updated", { ticketId: ticket._id, status: ticket.status });
    }

    sendSuccess(res, "Ticket status updated.", { ticket });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Admin resolve ticket
// @route   PATCH /api/tickets/:id/respond
// @access  Private/Admin
export const adminResolveTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNotes, resolution, status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { 
        adminNotes, 
        resolution, 
        status: status || "RESOLVED",
        resolvedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      sendError(res, "Ticket not found", 404);
      return;
    }

    if (ticket.user) {
      socketService.emitToRoom(`user_${ticket.user}`, "ticket_updated", { ticketId: ticket._id, status: ticket.status });
    }

    sendSuccess(res, "Ticket resolved successfully.", { ticket });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      sendError(res, "Ticket not found", 404);
      return;
    }

    sendSuccess(res, "Ticket deleted successfully.");
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

// @desc    Admin assign revisit (priority rework)
// @route   POST /api/tickets/:id/revisit
// @access  Private/Admin
export const adminAssignRevisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledAt, estimatedPay = 0 } = req.body;

    const ticket = await Ticket.findById(id).populate("booking");
    if (!ticket) {
      sendError(res, "Ticket not found", 404);
      return;
    }

    if (!ticket.booking) {
      sendError(res, "Ticket does not have an associated booking", 400);
      return;
    }

    const originalBooking = ticket.booking as any;

    // Create a new "Revisit" booking
    const newBooking = await Booking.create({
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
    socketService.emitToRoom(`user_${originalBooking.worker}`, "new_booking", { job: newBooking });
    // Notify the client that their ticket was resolved
    socketService.emitToRoom(`user_${originalBooking.client}`, "ticket_updated", { ticketId: ticket._id, status: "RESOLVED" });

    sendSuccess(res, "Priority revisit assigned and ticket resolved.", { ticket, newBooking });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
