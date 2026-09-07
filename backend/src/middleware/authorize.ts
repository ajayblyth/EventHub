import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";

export function authorize(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError("Not authenticated", 401));
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        return next(new AppError("User not found", 401));
      }

      const hasAllowedRole = user.roles.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasAllowedRole) {
        return next(new AppError("Access denied", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}