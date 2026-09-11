import { Router } from "express";

import validate from "../middleware/validate.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  verifyEmailOtpController,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Get currently logged-in user
router.get(
  "/me",
  protect,
  getMe
);

// Register
router.post(
  "/register",
  validate(registerSchema),
  register
);

// Login
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);

// Refresh access token
router.post(
  "/refresh-token",
  authRateLimiter,
  refreshToken
);

// Logout
router.post(
  "/logout",
  logout
);

// Organizer-only test route
router.get(
  "/organizer-test",
  protect,
  authorize("organizer"),
  (req, res) => {
    res.json({
      success: true,
      message: "Organizer access granted",
    });
  }
);

// Verify email using OTP
router.post(
  "/verify-email-otp",
  protect,
  verifyEmailOtpController
);

export default router;