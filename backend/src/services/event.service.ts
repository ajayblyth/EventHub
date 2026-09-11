import Event from "../models/Event.js";
import AppError from "../utils/AppError.js";

import User from "../models/User.js";
import {
  sendVerificationOtp,
} from "./emailVerification.service.js";

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

  // Email verification is required before publishing
  if (!user.isVerified) {
    await sendVerificationOtp(
      user._id.toString(),
      user.email
    );

    throw new AppError(
      "Please verify your email before publishing your EventHub event. A verification OTP has been sent to your email.",
      403
    );
  }

  // User is verified, so give them organizer role
  if (!user.roles.includes("organizer")) {
    user.roles.push("organizer");
    await user.save();
  }

  // Publish the event
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