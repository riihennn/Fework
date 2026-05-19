import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";
import { AuthRequest } from "../types";
import User from "../models/User.model";

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Support both cookie and Bearer header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      sendError(res, "Access denied. No token provided.", 401);
      return;
    }

    const payload = verifyToken(token);
    
    const user = await User.findById(payload.id).select("isBlocked");
    if (!user) {
      sendError(res, "User no longer exists.", 401);
      return;
    }
    if (user.isBlocked) {
      sendError(res, "Your account has been blocked by the admin.", 403);
      return;
    }

    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    sendError(res, "Invalid or expired token.", 401);
  }
};
