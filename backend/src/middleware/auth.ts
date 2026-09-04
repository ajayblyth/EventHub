

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

import type { AuthUser } from "../types/express.js";

export function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.accessToken;  //From the incoming HTTP request

    if (!token) {
      throw new AppError("Not authenticated", 401);
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

const decoded = jwt.verify(token, secret) as AuthUser;

    req.user = decoded;  //need to attach user to req object so next middleware/controller can use it

    next();
  } catch (error) {
    next(error);
  }
}

