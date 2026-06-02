"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllChats = exports.clearChat = exports.getMessages = void 0;
const Message_model_1 = __importDefault(require("../models/Message.model"));
const ChatRoom_model_1 = __importDefault(require("../models/ChatRoom.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const response_utils_1 = require("../utils/response.utils");
const getMessages = async (req, res) => {
    try {
        const { jobId } = req.params;
        if (!jobId) {
            return (0, response_utils_1.sendError)(res, "Job ID is required", 400);
        }
        let chatRoom = await ChatRoom_model_1.default.findOne({ bookingId: jobId });
        // Backwards compatibility for old jobs that don't have a chat room
        if (!chatRoom) {
            const job = await Booking_model_1.default.findById(jobId);
            if (!job) {
                return (0, response_utils_1.sendError)(res, "Job not found", 404);
            }
            chatRoom = await ChatRoom_model_1.default.create({
                bookingId: job._id,
                clientId: job.client,
                workerId: job.worker,
                isLocked: ["completed", "cancelled"].includes(job.status),
            });
        }
        const messages = await Message_model_1.default.find({ roomId: chatRoom._id }).sort({ createdAt: 1 });
        return (0, response_utils_1.sendSuccess)(res, "Messages fetched successfully", messages);
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return (0, response_utils_1.sendError)(res, "Failed to fetch messages", 500);
    }
};
exports.getMessages = getMessages;
const clearChat = async (req, res) => {
    try {
        const { jobId } = req.params;
        if (!jobId) {
            return (0, response_utils_1.sendError)(res, "Job ID is required", 400);
        }
        const chatRoom = await ChatRoom_model_1.default.findOne({ bookingId: jobId });
        if (!chatRoom) {
            return (0, response_utils_1.sendSuccess)(res, "Chat already empty", null); // if room doesn't exist, there are no messages anyway
        }
        // Delete all messages in this room
        await Message_model_1.default.deleteMany({ roomId: chatRoom._id });
        // Clear last message in room
        chatRoom.lastMessage = undefined;
        chatRoom.lastMessageAt = undefined;
        await chatRoom.save();
        return (0, response_utils_1.sendSuccess)(res, "Chat cleared successfully", null);
    }
    catch (error) {
        console.error("Error clearing chat:", error);
        return (0, response_utils_1.sendError)(res, "Failed to clear chat", 500);
    }
};
exports.clearChat = clearChat;
const clearAllChats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all chat rooms where the user is either the client or the worker
        const chatRooms = await ChatRoom_model_1.default.find({
            $or: [{ clientId: userId }, { workerId: userId }],
        });
        const roomIds = chatRooms.map((room) => room._id);
        // Delete all messages in all these rooms
        await Message_model_1.default.deleteMany({ roomId: { $in: roomIds } });
        // Clear last message in all these rooms
        await ChatRoom_model_1.default.updateMany({ _id: { $in: roomIds } }, { $unset: { lastMessage: "", lastMessageAt: "" } });
        return (0, response_utils_1.sendSuccess)(res, "All chats cleared successfully", null);
    }
    catch (error) {
        console.error("Error clearing all chats:", error);
        return (0, response_utils_1.sendError)(res, "Failed to clear all chats", 500);
    }
};
exports.clearAllChats = clearAllChats;
//# sourceMappingURL=message.controller.js.map