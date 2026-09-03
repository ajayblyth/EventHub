import { Router } from "express";
import {
  searchVenuesController,
  saveVenueController,
} from "../controllers/venue.controller.js";

const router = Router();

router.get("/search", searchVenuesController);

router.post("/", saveVenueController);

export default router;