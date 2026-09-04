import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;

  tickets: {
    ticketTierId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];

  totalAmount: number;

  status: "PENDING" | "CONFIRMED" | "CANCELLED";

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {  //who vooked
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {     //which event
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    tickets: [
      {
        ticketTierId: {
          type: Schema.Types.ObjectId,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);

export default Booking;