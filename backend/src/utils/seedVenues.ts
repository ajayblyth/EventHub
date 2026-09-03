import "dotenv/config";
import connectDB from "../config/db.js";
import Venue from "../models/Venue.js";

const venues = [
  {
    name: "Bangalore Palace",
    address: "Vasanth Nagar",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postalCode: "560052",
  },
  {
    name: "KTPO Convention Centre",
    address: "Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postalCode: "560066",
  },
  {
    name: "NIMHANS Convention Centre",
    address: "Hosur Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    postalCode: "560029",
  },
  {
    name: "Jio World Convention Centre",
    address: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400051",
  },
  {
    name: "Pragati Maidan",
    address: "Mathura Road",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    postalCode: "110001",
  },
];

async function seedVenues() {
  try {
    console.log("Starting venue seed...");

    await connectDB();

    await Venue.deleteMany({});

    await Venue.insertMany(venues);

    console.log("Venues seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed venues:", error);
    process.exit(1);
  }
}

seedVenues();