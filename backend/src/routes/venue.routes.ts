import { Router } from "express";

import {
  searchVenuesController,
  saveVenueController,
} from "../controllers/venue.controller.js";

import {
  protect
} from "../middleware/auth.js";


const router = Router();

router.get("/search", searchVenuesController);

router.post(
  "/",
  protect,
  saveVenueController
);

export default router;