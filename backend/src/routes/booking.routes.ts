import { Router } from "express";

import {
  createBookingController,
  getMyBookingsController,
  cancelBookingController,
  getEventBookingsController
} from "../controllers/booking.controller.js";

import validate from "../middleware/validate.js";
import { createBookingSchema } from "../validators/booking.validator.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
const router = Router();

router.post(
  "/",
  protect,
  validate(createBookingSchema),
  createBookingController
);


router.get(
  "/my-bookings",
  protect,
  getMyBookingsController
);



router.get(
  "/event/:eventId",
  protect,
  authorize("organizer"),
  getEventBookingsController
);


router.delete(
  "/:id",
  protect,
  cancelBookingController
);


export default router;