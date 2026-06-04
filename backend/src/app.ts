import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/error.middleware";

// ── Routes ───────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import workerRoutes from "./routes/worker.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";
import messageRoutes from "./routes/message.routes";
import skillRoutes from "./routes/skill.routes";
import uploadRoutes from "./routes/upload.routes";
import ticketRoutes from "./routes/ticket.routes";
import paymentRoutes from "./routes/payment.routes";
import http from "http";
import { SocketService } from "./services/socket.service";

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
export const socketService = new SocketService(server);
const PORT = process.env.PORT || 5000;

// ── Connect Database ─────────────────────────────────────────
connectDB();

import rateLimit from "express-rate-limit";

// ── Global Middleware ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allow cookies
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Fework API is running 🚀" });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payment", paymentRoutes);

// ── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 Fework API running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV}`);
});

export default app;
