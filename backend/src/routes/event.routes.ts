import { Router } from "express";

import {
  createEventController,
  getEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  publishEventController,
  getMyEventsController,
  getMyEventByIdController
} from "../controllers/event.controller.js";

import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const router = Router();

router.get("/", getEventsController);

router.get(
  "/my-events",
  protect,
  getMyEventsController
);


router.get(
  "/manage/:id",
  protect,
  getMyEventByIdController
);


router.get("/:id", getEventByIdController);

router.post(
  "/",
  protect,
  validate(createEventSchema),
  createEventController
);

router.patch(
  "/:id",
  protect,
  validate(updateEventSchema),
  updateEventController
);

router.delete(
  "/:id",
  protect,
  deleteEventController
);

router.post(
  "/:id/publish",
  protect,
  publishEventController
);



export default router;




/*
remeber
For a real ticketing platform, we'd probably eventually prefer soft deletion / status-based cancellation, because bookings, tickets, payments, and audit history may refer to an event.

But don't complicate the current implementation. We'll revisit this when we build bookings.

Add the route, then tell me created.
*/