import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Message from "../models/Message.model";
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

      // Handle sending a message
      socket.on("send_message", async (data: {
        jobId: string;
        senderId: string;
        senderModel: "User" | "Worker";
        text: string;
      }) => {
        try {
          const { jobId, senderId, senderModel, text } = data;
          
          if (!jobId || !senderId || !text) return;

          // Validate job exists
          const job = await Job.findById(jobId);
          if (!job) return;

          // Save to database
          const newMessage = await Message.create({
            job: jobId,
            sender: senderId,
            senderModel,
            text,
          });

          // Broadcast to everyone in the room
          this.io.to(jobId).emit("receive_message", newMessage);
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
