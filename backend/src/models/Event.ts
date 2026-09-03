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
      default: "",
      trim: true,
      maxlength: 300,
    },

 status: {
  type: String,
  enum: ["DRAFT", "PUBLISHED", "COMPLETED", "EXPIRED", "CANCELLED"],
  default: "DRAFT",
},

    startAt: {
      type: Date,
      required: true,
      index: true,
    },

    endAt: {
      type: Date,
      required: true,
      index: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
      },

      coordinates: {
        type: [Number],
      },
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
//main img of evnt
        order: {
          type: Number,
          default: 0,
        },
      },
    ],

    ticketTiers: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          default: "",
          trim: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        currency: {
          type: String,
          default: "INR",
          enum: ["INR"],
        },

        quantityTotal: {
          type: Number,
          required: true,
          min: 1,
        },

        quantitySold: {
          type: Number,
          default: 0,
          min: 0,
        },

        minPerOrder: {
          type: Number,
          default: 1,
          min: 1,
        },

        maxPerOrder: {
          type: Number,
          default: 10,
          min: 1,
        },

        salesStartAt: {
          type: Date,
        },

        salesEndAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ location: "2dsphere" });

const Event = mongoose.model("Event", eventSchema);

export default Event;