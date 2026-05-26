import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  job: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderModel: "User" | "Worker";
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel", // dynamically reference either User or Worker
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Worker"],
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
