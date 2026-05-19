import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,  // allows multiple docs with null phone
    },
    role: {
      type: String,
      enum: ["client", "worker", "admin"],
      default: "client",
    },
    avatar: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Hash password before saving ──────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
