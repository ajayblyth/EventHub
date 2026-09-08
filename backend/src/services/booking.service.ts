import mongoose from "mongoose";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";
import { generateBookingQrCode } from "../utils/qrCode.js";
import User from "../models/User.js";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail, } from "../utils/email.js";


// createBooking
export async function createBooking(
  userId: string,
  eventId: string,
  selectedTickets: {
    ticketTierId: string;
    quantity: number;
  }[]
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const event = await Event.findOne({
      _id: eventId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    }).session(session);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.startAt <= new Date()) {
      throw new AppError(
        "Tickets cannot be booked for this event",
        400
      );
    }

    if (!selectedTickets.length) {
      throw new AppError(
        "At least one ticket is required",
        400
      );
    }

    const bookingTickets = [];
    let totalAmount = 0;

    for (const selectedTicket of selectedTickets) {
      const ticket = event.ticketTiers.find(
        (tier: any) =>
          tier._id.toString() ===
          selectedTicket.ticketTierId
      );

      if (!ticket) {
        throw new AppError(
          "Ticket tier not found",
          404
        );
      }

      const available =
        ticket.quantityTotal - ticket.quantitySold;

      if (selectedTicket.quantity > available) {
        throw new AppError(
          `Only ${available} ${ticket.name} tickets are available`,
          400
        );
      }

      if (
        selectedTicket.quantity < ticket.minPerOrder ||
        selectedTicket.quantity > ticket.maxPerOrder
      ) {
        throw new AppError(
          `Invalid quantity for ${ticket.name}`,
          400
        );
      }

      const subtotal =
        ticket.price * selectedTicket.quantity;

      bookingTickets.push({
        ticketTierId: ticket._id,
        name: ticket.name,
        price: ticket.price,
        quantity: selectedTicket.quantity,
        subtotal,
      });

      totalAmount += subtotal;

      ticket.quantitySold += selectedTicket.quantity;
    }

    await event.save({ session });

    const [booking] = await Booking.create(
      [
        {
          userId,
          eventId,
          tickets: bookingTickets,
          totalAmount,
          status: "CONFIRMED",
        },
      ],
      { session }
    );

    if (!booking) {
      throw new AppError(
        "Failed to create booking",
        500
      );
    }

    await session.commitTransaction();

    const user = await User.findById(userId);

    if (user) {
      const bookingForEmail = await Booking.findById(
        booking._id.toString()
      ).populate({
        path: "eventId",
        select: "title startAt endAt venueId",
        populate: {
          path: "venueId",
          select: "name address",
        },
      });

      if (bookingForEmail) {
        try {
          await sendBookingConfirmationEmail(
            user.email,
            bookingForEmail
          );
        } catch (emailError) {
          console.error(
            "BOOKING CONFIRMATION EMAIL ERROR:",
            emailError
          );
        }
      }
    }

    return booking;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}


//get bookings

export async function getMyBookings(userId: string) {
  const bookings = await Booking.find({
    userId,
  })
    .populate({
      path: "eventId",
      select: "title startAt endAt venueId",
      populate: {
        path: "venueId",
        select: "name address",
      },
    })
    .sort({ createdAt: -1 });

  return bookings;
}


// cancel booking
export async function cancelBooking(
  userId: string,
  bookingId: string
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: "CONFIRMED",
    }).session(session);

    if (!booking) {
      throw new AppError(
        "Booking not found or already cancelled",
        404
      );
    }

    const event = await Event.findById(
      booking.eventId
    ).session(session);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    for (const bookedTicket of booking.tickets) {
      const ticket = event.ticketTiers.find(
        (tier: any) =>
          tier._id.toString() ===
          bookedTicket.ticketTierId.toString()
      );

      if (ticket) {
        ticket.quantitySold -= bookedTicket.quantity;
      }
    }

    booking.status = "CANCELLED";

    await event.save({ session });
    await booking.save({ session });

    await session.commitTransaction();

    const user = await User.findById(userId);

    if (user) {
      const bookingForEmail = await Booking.findById(
        booking._id.toString()
      ).populate({
        path: "eventId",
        select: "title startAt endAt venueId",
        populate: {
          path: "venueId",
          select: "name address",
        },
      });

      if (bookingForEmail) {
        try {
          await sendBookingCancellationEmail(
            user.email,
            bookingForEmail
          );
        } catch (emailError) {
          console.error(
            "BOOKING CANCELLATION EMAIL ERROR:",
            emailError
          );
        }
      }
    }

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}


//get events bookings

export async function getEventBookings(
  eventId: string,
  organizerId: string
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId,
  });

  if (!event) {
    throw new AppError(
      "Event not found or access denied",
      404
    );
  }

  const bookings = await Booking.find({
    eventId,
  })
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 });

  return {
    event: {
      _id: event._id,
      title: event.title,
    },
    bookings,
  };
}



export async function getBookingById(
  userId: string,
  bookingId: string
) {
  const booking = await Booking.findOne({
    _id: bookingId,
    userId,
  }).populate({
    path: "eventId",
    select: "title startAt endAt venueId",
    populate: {
      path: "venueId",
      select: "name address",
    },
  });

  if (!booking) {
    throw new AppError(
      "Booking not found",
      404
    );
  }

  const qrCode = await generateBookingQrCode(
    booking._id.toString()
  );

  return {
    booking,
    qrCode,
  };
}


/*

Transaction — brief concept

A transaction means:

Perform multiple database operations as one unit — either ALL succeed or ALL are undone.

In your booking:

1. Reduce ticket quantity
2. Save updated Event
3. Create Booking

These operations are related. You don't want this situation:

Event ticketSold updated ✅
Booking creation failed ❌

Because then tickets are marked as sold but the user has no booking.
*/