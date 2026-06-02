"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const Message_model_1 = __importDefault(require("../models/Message.model"));
const ChatRoom_model_1 = __importDefault(require("../models/ChatRoom.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
class SocketService {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                credentials: true,
            },
        });
        this.initialize();
    }
    initialize() {
        this.io.on("connection", (socket) => {
            console.log(`[Socket.io] Client connected: ${socket.id}`);
            // Join a specific job room
            socket.on("join_job", (jobId) => {
                socket.join(jobId);
                console.log(`[Socket.io] Client ${socket.id} joined room: ${jobId}`);
            });
            // Join a user-specific room for notifications
            socket.on("join_user", (userId) => {
                socket.join(`user_${userId}`);
                console.log(`[Socket.io] Client ${socket.id} joined user room: user_${userId}`);
            });
            // Handle sending a message
            socket.on("send_message", async (data) => {
                try {
                    const { jobId, senderId, senderRole, message, messageType = "text" } = data;
                    if (!jobId || !senderId || !message)
                        return;
                    // Validate room exists and is not locked
                    const chatRoom = await ChatRoom_model_1.default.findOne({ bookingId: jobId });
                    if (!chatRoom)
                        return;
                    if (chatRoom.isLocked) {
                        socket.emit("error", { message: "Chat room is locked" });
                        return;
                    }
                    // Save to database
                    const newMessage = await Message_model_1.default.create({
                        roomId: chatRoom._id,
                        senderId,
                        senderRole,
                        message,
                        messageType,
                    });
                    // Update chat room last message
                    chatRoom.lastMessage = message;
                    chatRoom.lastMessageAt = new Date();
                    await chatRoom.save();
                    // Broadcast to everyone in the room
                    this.io.to(jobId).emit("receive_message", newMessage);
                    // Find the recipient and emit a message_notification to their user room
                    const job = await Booking_model_1.default.findById(jobId).populate("worker");
                    if (job) {
                        let recipientId;
                        if (senderRole === "client") {
                            const workerObj = job.worker;
                            recipientId = workerObj.user ? workerObj.user.toString() : workerObj.toString();
                        }
                        else {
                            recipientId = job.client.toString();
                        }
                        const senderUser = await User_model_1.default.findById(senderId);
                        const senderName = senderUser ? senderUser.name : (senderRole === "client" ? "Client" : "Worker");
                        this.io.to(`user_${recipientId}`).emit("message_notification", {
                            jobId,
                            senderName,
                            message,
                            createdAt: newMessage.createdAt,
                        });
                    }
                }
                catch (error) {
                    console.error("[Socket.io] Error sending message:", error);
                }
            });
            socket.on("disconnect", () => {
                console.log(`[Socket.io] Client disconnected: ${socket.id}`);
            });
        });
    }
    // Allow emitting events from external controllers if needed
    emitToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socket.service.js.map