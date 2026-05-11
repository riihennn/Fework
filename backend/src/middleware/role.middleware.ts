import { Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";
import { AuthRequest, UserRole } from "../types";

export const requireRole = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Not authenticated.", 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, "Access forbidden: insufficient permissions.", 403);
      return;
    }
    next();
  };
