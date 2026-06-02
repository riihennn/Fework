"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const User_model_1 = __importDefault(require("../models/User.model"));
const requireAuth = async (req, res, next) => {
    try {
        // Support both cookie and Bearer header
        const token = req.cookies?.token ||
            req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            (0, response_utils_1.sendError)(res, "Access denied. No token provided.", 401);
            return;
        }
        const payload = (0, jwt_utils_1.verifyToken)(token);
        const user = await User_model_1.default.findById(payload.id).select("isBlocked");
        if (!user) {
            (0, response_utils_1.sendError)(res, "User no longer exists.", 401);
            return;
        }
        if (user.isBlocked) {
            (0, response_utils_1.sendError)(res, "Your account has been blocked by the admin.", 403);
            return;
        }
        req.user = { id: payload.id, role: payload.role };
        next();
    }
    catch {
        (0, response_utils_1.sendError)(res, "Invalid or expired token.", 401);
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map