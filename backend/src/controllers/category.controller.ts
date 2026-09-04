import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getCategories,
  createCategory,
} from "../services/category.service.js";

export async function getCategoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await getCategories();

    res.status(200).json({
      categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, slug, description } = req.body;

    const category = await createCategory(
      name,
      slug,
      description
    );

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}