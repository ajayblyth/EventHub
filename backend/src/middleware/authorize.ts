import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const hasAllowedRole = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAllowedRole) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
}
