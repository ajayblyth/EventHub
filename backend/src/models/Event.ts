import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "DRAFT",
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE", "UNLISTED"],
      default: "PUBLIC",
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        alt: {
          type: String,
          default: "",
        },

        isMain: {
          type: Boolean,
          default: false,
        },

        order: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;