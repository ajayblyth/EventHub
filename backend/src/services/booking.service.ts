import mongoose from "mongoose";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";

export async function createBooking(
  userId: string,
  eventId: string,
  selectedTickets: {
    ticketTierId: string;
    quantity: number;
  }[]
) {
  const event = await Event.findOne({
    _id: eventId,
    status: "PUBLISHED",
    visibility: "PUBLIC",
  });

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
        tier._id.toString() === selectedTicket.ticketTierId
    );

    if (!ticket) {
      throw new AppError("Ticket tier not found", 404);
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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

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

    await session.commitTransaction();

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
    .populate("eventId", "title startAt endAt")
    .sort({ createdAt: -1 });

  return bookings;
}


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
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return bookings;
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