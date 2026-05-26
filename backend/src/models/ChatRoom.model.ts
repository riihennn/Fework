import mongoose, { Schema, Document } from "mongoose";

export interface IChatRoom extends Document {
  bookingId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  isLocked: boolean;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true, // 1 Booking -> 1 Chat Room
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);
export default ChatRoom;
