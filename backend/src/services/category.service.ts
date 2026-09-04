import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";

export async function getCategories() {
  return Category.find().sort({ name: 1 });
}

export async function createCategory(
  name: string,
  slug: string,
  description?: string
) {
  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    throw new AppError(
      "Category with this name or slug already exists",
      409
    );
  }

  const category = new Category({
    name,
    slug,
    description,
  });

  return category.save();
}