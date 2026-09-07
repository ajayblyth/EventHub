import { Router } from "express";

import {
  getCategoriesController,
  createCategoryController,
} from "../controllers/category.controller.js";

import { protect } from "../middleware/auth.js";

import { authorize } from "../middleware/authorize.js";
const router = Router();

router.get(
  "/",
  getCategoriesController
);

router.post(
  "/",
  protect,
  authorize("organizer"),
  createCategoryController
);

export default router;