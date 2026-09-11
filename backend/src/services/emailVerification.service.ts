import crypto from "crypto";
import EmailVerification from "../models/EmailVerification.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/email.js";

export async function sendVerificationOtp(
  userId: string,
  email: string
) {
  const otp = crypto
    .randomInt(100000, 1000000)
    .toString();

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await EmailVerification.deleteMany({
    userId,
  });

  await EmailVerification.create({
    userId,
    email,
    otp,
    expiresAt,
  });

  console.log("VERIFICATION OTP EMAIL TO:", email);
  
  await sendEmail(
    email,
    "Verify your EventHub email",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">
        <h2>Verify your EventHub email</h2>

        <p>
          Use the OTP below to verify your email address:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p>
          This OTP will expire in 10 minutes.
        </p>

        <p style="color: #64748b; font-size: 14px;">
          If you did not request this verification, you can ignore this email.
        </p>
      </div>
    `
  );
}

export async function verifyEmailOtp(
  userId: string,
  otp: string
) {
  const verification =
    await EmailVerification.findOne({
      userId,
      otp,
      expiresAt: { $gt: new Date() },
    });

  if (!verification) {
    throw new AppError(
      "Invalid or expired OTP",
      400
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  user.isVerified = true;

  await user.save();

  await EmailVerification.deleteMany({
    userId,
  });

  return user;
}