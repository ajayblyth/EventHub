import { Router } from "express";

import {
  createEventController,
  getEventsController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  publishEventController,
  getMyEventsController,
  getMyEventByIdController, cancelEventController
} from "../controllers/event.controller.js";

import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
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
  authorize("organizer"),
  validate(createEventSchema),
  createEventController
);

router.patch(
  "/:id",
  protect,
  authorize("organizer"),
  validate(updateEventSchema),
  updateEventController
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("organizer"),
  cancelEventController
);

router.delete(
  "/:id",
  protect,
  authorize("organizer"),
  deleteEventController
);

router.post(
  "/:id/publish",
  protect,
  authorize("organizer"),
  publishEventController
);


export default router;




/*
remeber
For a real ticketing platform, we'd probably eventually prefer soft deletion / status-based cancellation, because bookings, tickets, payments, and audit history may refer to an event.

But don't complicate the current implementation. We'll revisit this when we build bookings.

Add the route, then tell me created.
*/