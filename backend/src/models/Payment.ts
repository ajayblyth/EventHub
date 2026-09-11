import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;

  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;

  amount: number;
  currency: string;

  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpaySignature: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PAID",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);

export default Payment;