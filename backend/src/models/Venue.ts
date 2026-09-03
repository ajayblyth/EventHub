import mongoose, { Schema, Document } from "mongoose";

export interface IVenue extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  placeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    postalCode: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    placeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Venue = mongoose.model<IVenue>("Venue", venueSchema);

export default Venue;