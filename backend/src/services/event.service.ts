import Event from "../models/Event.js";
import AppError from "../utils/AppError.js";

import User from "../models/User.js";
import { generateVerificationToken } from "../utils/verificationToken.js";
import { sendEmail } from "../utils/email.js";

export async function createEvent(
  data: any, //need to change
  userId: string
) {
  const event = await Event.create({
    ...data,
    organizerId: userId,
  });

  return event;
}

export async function getEvents() {
  const events = await Event.find({
    status: "PUBLISHED",
    visibility: "PUBLIC",
  })
    .populate("categoryIds", "name slug")
    .sort({ startAt: 1 });

  return events;
}

//my events

export async function getMyEvents(userId: string) {
  const now = new Date();

  await Event.updateMany(
    {
      organizerId: userId,
      status: "DRAFT",
      startAt: { $lte: now },
    },
    {
      $set: {
        status: "EXPIRED",
      },
    }
  );

  await Event.updateMany(
    {
      organizerId: userId,
      status: "PUBLISHED",
      endAt: { $lte: now },
    },
    {
      $set: {
        status: "COMPLETED",
      },
    }
  );

  const events = await Event.find({
    organizerId: userId,
  })
    .populate("venueId")
    .populate("categoryIds", "name slug")
    .sort({ createdAt: -1 });

  return events;
}



export async function getMyEventById(
  eventId: string,
  userId: string
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  })
    .populate("venueId")
    .populate("categoryIds", "name slug");

  if (!event) {
    throw new AppError(
      "Event not found or access denied",
      404
    );
  }

  return event;
}

//get eventbyid


export async function getEventById(eventId: string) {
  const event = await Event.findOne({
    _id: eventId,
    status: "PUBLISHED",
    visibility: "PUBLIC",
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
}

//patch event
export async function updateEvent(
  eventId: string,
  userId: string,
  data: any
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  });


  //Is this the event?&Does this user own it?

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  Object.assign(event, data);

//updates the fields supplied by the user.
  await event.save();

  return event;
}

//delete
export async function deleteEvent(
  eventId: string,
  userId: string
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  const hasSoldTickets = event.ticketTiers.some(
    (ticket: any) => ticket.quantitySold > 0
  );

  if (hasSoldTickets) {
    throw new AppError(
      "Event cannot be deleted because tickets have been sold. Cancel the event instead.",
      400
    );
  }

  if (
    event.status !== "DRAFT" &&
    event.status !== "PUBLISHED"
  ) {
    throw new AppError(
      "This event cannot be deleted",
      400
    );
  }

  await event.deleteOne();
}


export async function cancelEvent(
  eventId: string,
  userId: string
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  });

  if (!event) {
    throw new AppError(
      "Event not found or access denied",
      404
    );
  }

  if (event.status !== "PUBLISHED") {
    throw new AppError(
      "Only published events can be cancelled",
      400
    );
  }

  event.status = "CANCELLED";

  await event.save();

  return event;
}


//publish
export async function publishEvent(
  eventId: string,
  userId: string
) {
  const event = await Event.findOne({
    _id: eventId,
    organizerId: userId,
  });

  if (!event) {
    throw new AppError("Event not found or access denied", 404);
  }

  if (event.status !== "DRAFT") {
    throw new AppError("Only draft events can be published", 400);
  }

  if (event.startAt <= new Date()) {
    throw new AppError(
      "Event cannot be published after it has started",
      400
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isVerified) {
    const { token, hashedToken } = generateVerificationToken();

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

const verificationUrl =
  `http://localhost:5173/verify-email?token=${token}&eventId=${event._id}`;
  
  await sendEmail(
      user.email,
      "Verify your email to publish your EventHub event",
      `
        <h2>Verify your email</h2>

        <p>
          Please verify your email address before publishing your event on EventHub.
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify Email
          </a>
        </p>

        <p>This link will expire in 24 hours.</p>
      `
    );

    throw new AppError(
      "Please verify your email before publishing your event. A verification email has been sent.",
      403
    );
  }

  event.status = "PUBLISHED";

  await event.save();

  return event;
}


/*
Event.find({
  status: "PUBLISHED",
  visibility: "PUBLIC",
})
means:
Give me only events that are published and publicly visible.
Then:
.sort({ startAt: 1 })
means:
Show upcoming events starting from the earliest date.
Notice we don't use protect for GET.

Anyone should be able to browse public events:
*/