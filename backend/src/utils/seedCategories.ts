import mongoose from "mongoose";
import "dotenv/config";

import Category from "../models/Category.js";

const categories = [
  {
    name: "Music",
    slug: "music",
    description: "Concerts, live music and music festivals",
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Technology, software and developer events",
  },
  {
    name: "Business",
    slug: "business",
    description: "Business, networking and professional events",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Sports events and competitions",
  },
  {
    name: "Food & Drink",
    slug: "food-drink",
    description: "Food festivals, dining and culinary events",
  },
  {
    name: "Arts & Culture",
    slug: "arts-culture",
    description: "Art, culture and creative events",
  },
  {
    name: "Education",
    slug: "education",
    description: "Workshops, classes and educational events",
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Health, fitness and wellness events",
  },
];

async function seedCategories() {
  try {
await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");

    await Category.deleteMany({});

    await Category.insertMany(categories);

    console.log("Categories seeded successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to seed categories:", error);
    process.exit(1);
  }
}

seedCategories();