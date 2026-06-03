"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const error_middleware_1 = require("./middleware/error.middleware");
// ── Routes ───────────────────────────────────────────────────
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const worker_routes_1 = __importDefault(require("./routes/worker.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const http_1 = __importDefault(require("http"));
const socket_service_1 = require("./services/socket.service");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.socketService = new socket_service_1.SocketService(server);
const PORT = process.env.PORT || 5000;
// ── Connect Database ─────────────────────────────────────────
(0, db_1.default)();
// ── Global Middleware ────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allow cookies
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Fework API is running 🚀" });
});
// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", auth_routes_1.default);
app.use("/api/workers", worker_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/messages", message_routes_1.default);
app.use("/api/skills", skill_routes_1.default);
app.use("/api/upload", upload_routes_1.default);
app.use("/api/tickets", ticket_routes_1.default);
app.use("/api/payment", payment_routes_1.default);
// ── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});
// ── Global Error Handler ─────────────────────────────────────
app.use(error_middleware_1.errorHandler);
// ── Start Server ─────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`\n🚀 Fework API running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map