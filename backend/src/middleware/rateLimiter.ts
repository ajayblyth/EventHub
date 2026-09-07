import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});


/*
Meaning:

Same IP
  ↓
maximum 10 requests
  ↓
within 15 minutes

Important: this is request-based, not failed-login-based. It is a simple protection suitable for your current OJT project. Express specifically discusses stronger username + IP failed-attempt tracking as an option for serious brute-force protection.
*/