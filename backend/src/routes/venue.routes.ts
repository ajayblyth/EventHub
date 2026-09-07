import { Router } from "express";

import {
  searchVenuesController,
  saveVenueController,
} from "../controllers/venue.controller.js";

import { protect
 } from "../middleware/auth.js";

 import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/search", searchVenuesController);

router.post(
  "/",
  protect,
  authorize("organizer"),
  saveVenueController
);

export default router;