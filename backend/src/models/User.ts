import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["attendee", "organizer"],
      default: "attendee",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    companyName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 150,
    },

    website: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      address1: {
        type: String,
        default: null,
        trim: true,
        maxlength: 200,
      },

      address2: {
        type: String,
        default: null,
        trim: true,
        maxlength: 200,
      },

      country: {
        type: String,
        default: null,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        default: null,
        trim: true,
        maxlength: 100,
      },

      postalCode: {
        type: String,
        default: null,
        trim: true,
        maxlength: 20,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;