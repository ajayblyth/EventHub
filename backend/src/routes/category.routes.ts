import { Router } from "express";

import {
  getCategoriesController,
  createCategoryController,
} from "../controllers/category.controller.js";

import { protect } from "../middleware/auth.js";
const router = Router();

router.get(
  "/",
  getCategoriesController
);

router.post(
  "/",
  protect,
  createCategoryController
);

export default router;