1. Read Event
2. Check available tickets
3. Increase quantitySold
4. Start transaction
5. Save Event
6. Create Booking

The problem is that steps 1–3 happen before the transaction starts.

For example:

Booking A reads: General sold = 1
Booking B reads: General sold = 1

A → changes 1 → 5
B → changes 1 → 4

A saves 5
B saves 4   ← A's update can be overwritten

This is a classic read → modify → save race condition. Mongoose specifically documents that a document can change between findOne() and save(), and recommends atomic updates or transactions when this matters.

A transaction also makes the event inventory update + booking creation one unit: if one fails, the whole transaction can roll back.

----
createbooking in booking,service 
What changed?

This:

}).session(session);

means:

"Read this Event as part of this transaction."

Mongoose supports loading a document with .session(session) and then saving it within that same transaction.

Don't change anything else yet.

Once you've made this change, tell me done and we'll do Step 2.

Today 12:28 AM
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
  } syntax error, fix

Yes — you’re missing the closing } for the if (!event) block before the next if.

Your code should be:

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

The important missing part was:

    }

after:

throw new AppError("Event not found", 404);

Now your braces are correct. Don't change anything else yet.

You're right. I misunderstood your point.

The session variable is function-scoped, but your try block is indeed the problem with the code I gave you: I started the transaction and then left the rest of your function outside the shown block. We need to restructure the whole function, not just paste the first part.

And there's an even cleaner way: use session.withTransaction(), which Mongoose recommends because it handles commit/abort automatically.

Replace the whole createBooking() with this
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
    let booking;

    await session.withTransaction(async () => {
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
          ticket.quantityTotal -
          ticket.quantitySold;

        if (selectedTicket.quantity > available) {
          throw new AppError(
            `Only ${available} ${ticket.name} tickets are available`,
            400
          );
        }

        if (
          selectedTicket.quantity <
            ticket.minPerOrder ||
          selectedTicket.quantity >
            ticket.maxPerOrder
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

        ticket.quantitySold +=
          selectedTicket.quantity;
      }

      await event.save({ session });

      [booking] = await Booking.create(
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
    });

    return booking;
  } finally {
    await session.endSession();
  }
}
Why this structure?

Now the entire process is inside:

await session.withTransaction(async () => {
   // read event
   // validate
   // increase quantitySold
   // save event
   // create booking
});

So Event update + Booking creation belong to the same transaction. If something throws an error, the transaction is aborted automatically.

Also, because the Event is fetched with:

.session(session)

Mongoose associates that document with the session, so its save() participates in the same transaction.

One important point: this fixes the transaction structure, but it does not yet completely solve concurrent overselling. We'll handle that separately after you confirm this code compiles.

some syntax error, fix and give 
i mean for this import mongoose from "mongoose";
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
        tier._id.toString() === selectedTicket.ticketTierId
    );

    if (!ticket) {
      throw new AppError("Ticket tier not found", 404);
    }

    const available =
      ticket.quantityTotal - ticket.quantitySold;

    if (selectedTicket.quantity > available) {
      throw new AppError(
        Only ${available} ${ticket.name} tickets are available,
        400
      );
    }

    if (
      selectedTicket.quantity < ticket.minPerOrder ||
      selectedTicket.quantity > ticket.maxPerOrder
    ) {
      throw new AppError(
        Invalid quantity for ${ticket.name},
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


Yes. You accidentally have two session declarations and two try blocks. Remove the second one completely.

Here is your corrected full function:

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

    await session.commitTransaction();

    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

The key fix is that there is now only one:

const session = await mongoose.startSession();

and one transaction.

ok done , next

Good. Now Step 2 is important: the transaction structure is fixed, but it still doesn't fully protect quantitySold from concurrent bookings.

Your current code still does:

const event = await Event.findOne(...);

...

ticket.quantitySold += selectedTicket.quantity;

...

await event.save({ session });

The problem is the read → modify → save pattern. If two requests read the same old value, one update can overwrite the other. Mongoose specifically notes this race with save() and recommends atomic updates or transactions for this situation.

What we'll do next

We'll make the inventory update atomic:

Check available
      ↓
Increase quantitySold
      ↓
MongoDB performs it as one update

This is important because your EventHub requirement is prevent overselling.

----
our current quantitySold problem is best fixed by making the inventory update atomic. Mongoose documents that findOneAndUpdate() is atomic, unlike a simple findOne() → modify → save() sequence.

Step 2 — understand the change

Currently:

ticket.quantitySold += selectedTicket.quantity;

means:

Read 1
 ↓
calculate 1 + 3 = 4
 ↓
save 4

Two simultaneous bookings can both read 1 and overwrite each other.

We want MongoDB itself to do:

quantitySold = quantitySold + quantity

using $inc.

But there's a complication

Your ticketTiers are embedded inside Event, so we can't simply do:

Event.findOneAndUpdate(...)

with a normal field. We need to target the correct embedded ticket using its _id, while also checking that enough tickets remain.

So the next change should be made carefully.

For now, don't modify your code. Your current function is a good baseline.

Next we'll replace this part:

ticket.quantitySold += selectedTicket.quantity;

with an atomic inventory update that also prevents overselling.