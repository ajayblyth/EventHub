import { Router } from "express";

import {
  createBookingController,
  getMyBookingsController,
  cancelBookingController,
  getEventBookingsController
} from "../controllers/booking.controller.js";

import { protect } from "../middleware/auth.js";
const router = Router();

router.post(
  "/",
  protect,
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
  getEventBookingsController
);



router.delete(
  "/:id",
  protect,
  cancelBookingController
);


export default router;