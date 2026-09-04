import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";
import AppError from "../utils/AppError.js";
import { refreshAccessToken } from "../services/auth.service.js";



export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await loginUser(req.body);

    res
      .cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

        //send this cookie only over HTTPS when we're in production. We normally use HTTP locally:
        // sameSite: "strict",

        sameSite: "lax",
        // tells the browser to be very restrictive about sending your authentication cookie when a request comes from another site, helping protect against CSRF.
    path: "/",

        maxAge: 15 * 60 * 1000, //15 minutes in ms
      })

      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: "strict",

        sameSite: "lax",
            path: "/",

        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: result.user,
      });
  } catch (error) {
    next(error);
  }
}



export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await getCurrentUser(req.user!.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}


export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("Refresh token is required", 401);
    }

    const result = await refreshAccessToken(token);

    res
      .cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Access token refreshed",
      });
  } catch (error) {
    next(error);
  }
}

export function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    next(error);
  }
}



/*
Why this is better

Instead of:

JSON
├── user
├── accessToken ❌
└── refreshToken ❌

we have:

HttpOnly Cookies
├── accessToken
└── refreshToken

JSON
└── user information

HttpOnly means frontend JavaScript cannot directly read the token, which reduces exposure to XSS attacks.

*/