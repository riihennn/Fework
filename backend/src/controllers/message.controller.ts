import { Response } from "express";
import { AuthRequest } from "../types";
import Message from "../models/Message.model";
import ChatRoom from "../models/ChatRoom.model";
import Job from "../models/Booking.model";
import { sendError, sendSuccess } from "../utils/response.utils";

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return sendError(res, "Job ID is required", 400);
    }

    let chatRoom = await ChatRoom.findOne({ bookingId: jobId });
    
    // Backwards compatibility for old jobs that don't have a chat room
    if (!chatRoom) {
      const job = await Job.findById(jobId);
      if (!job) {
        return sendError(res, "Job not found", 404);
      }
      chatRoom = await ChatRoom.create({
        bookingId: job._id,
        clientId: job.client,
        workerId: job.worker,
        isLocked: ["completed", "cancelled"].includes(job.status),
      });
    }

    const messages = await Message.find({ roomId: chatRoom._id }).sort({ createdAt: 1 });

    return sendSuccess(res, "Messages fetched successfully", messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return sendError(res, "Failed to fetch messages", 500);
  }
};

export const clearChat = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return sendError(res, "Job ID is required", 400);
    }

    const chatRoom = await ChatRoom.findOne({ bookingId: jobId });
    if (!chatRoom) {
      return sendSuccess(res, "Chat already empty", null); // if room doesn't exist, there are no messages anyway
    }

    // Delete all messages in this room
    await Message.deleteMany({ roomId: chatRoom._id });

    // Clear last message in room
    chatRoom.lastMessage = undefined;
    chatRoom.lastMessageAt = undefined;
    await chatRoom.save();

    return sendSuccess(res, "Chat cleared successfully", null);
  } catch (error) {
    console.error("Error clearing chat:", error);
    return sendError(res, "Failed to clear chat", 500);
  }
};

export const clearAllChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all chat rooms where the user is either the client or the worker
    const chatRooms = await ChatRoom.find({
      $or: [{ clientId: userId }, { workerId: userId }],
    });

    const roomIds = chatRooms.map((room) => room._id);

    // Delete all messages in all these rooms
    await Message.deleteMany({ roomId: { $in: roomIds } });

    // Clear last message in all these rooms
    await ChatRoom.updateMany(
      { _id: { $in: roomIds } },
      { $unset: { lastMessage: "", lastMessageAt: "" } }
    );

    return sendSuccess(res, "All chats cleared successfully", null);
  } catch (error) {
    console.error("Error clearing all chats:", error);
    return sendError(res, "Failed to clear all chats", 500);
  }
};
