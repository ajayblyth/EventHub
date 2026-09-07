import { Router } from "express";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { register, login, getMe,  
  refreshToken, logout, becomeOrganizerController,
verifyEmailController }
 from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";


const router = Router();


router.get("/me", protect, getMe);

router.post( "/register", validate(registerSchema), register);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);

router.post(
  "/refresh-token",
  authRateLimiter,
  refreshToken
);


router.post("/logout", logout);

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

router.post(
  "/become-organizer",
  protect,
  becomeOrganizerController
);


router.get(
  "/verify-email",
  verifyEmailController
);

export default router;