import bcrypt from "bcryptjs";

import User from "../models/User.js";

import AppError from "../utils/AppError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import jwt from "jsonwebtoken";

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles?: ("attendee" | "organizer")[];
}) {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    roles: data.roles ?? ["attendee"],
  });

  return user;
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordCorrect = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(
    user._id.toString(),
    user.roles
  );

  const refreshToken = generateRefreshToken(
    user._id.toString()
  );

return {
  user: {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: user.roles,
  },
  accessToken,
  refreshToken,
};
}

export async function refreshAccessToken(token: string) {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.userId) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Get the latest roles from the database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.roles
    );

    return {
      accessToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select(
    "-password"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}