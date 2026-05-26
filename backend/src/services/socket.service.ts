import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Message from "../models/Message.model";
import ChatRoom from "../models/ChatRoom.model";
import User from "../models/User.model";
import Job from "../models/Booking.model";

export class SocketService {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    this.initialize();
  }

  private initialize() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[Socket.io] Client connected: ${socket.id}`);

      // Join a specific job room
      socket.on("join_job", (jobId: string) => {
        socket.join(jobId);
        console.log(`[Socket.io] Client ${socket.id} joined room: ${jobId}`);
      });

      // Join a user-specific room for notifications
      socket.on("join_user", (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Client ${socket.id} joined user room: user_${userId}`);
      });

      // Handle sending a message
      socket.on("send_message", async (data: {
        jobId: string;
        senderId: string;
        senderRole: "client" | "worker";
        message: string;
        messageType?: "text" | "image";
      }) => {
        try {
          const { jobId, senderId, senderRole, message, messageType = "text" } = data;
          
          if (!jobId || !senderId || !message) return;

          // Validate room exists and is not locked
          const chatRoom = await ChatRoom.findOne({ bookingId: jobId });
          if (!chatRoom) return;
          if (chatRoom.isLocked) {
            socket.emit("error", { message: "Chat room is locked" });
            return;
          }

          // Save to database
          const newMessage = await Message.create({
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
          const job = await Job.findById(jobId).populate("worker");
          if (job) {
            let recipientId: string;
            if (senderRole === "client") {
              const workerObj = job.worker as any;
              recipientId = workerObj.user ? workerObj.user.toString() : workerObj.toString();
            } else {
              recipientId = job.client.toString();
            }

            const senderUser = await User.findById(senderId);
            const senderName = senderUser ? senderUser.name : (senderRole === "client" ? "Client" : "Worker");

            this.io.to(`user_${recipientId}`).emit("message_notification", {
              jobId,
              senderName,
              message,
              createdAt: newMessage.createdAt,
            });
          }
        } catch (error) {
          console.error("[Socket.io] Error sending message:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
      });
    });
  }

  // Allow emitting events from external controllers if needed
  public emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }
}
