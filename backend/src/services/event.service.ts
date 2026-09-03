import Event from "../models/Event.js";
import AppError from "../utils/AppError.js";

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
  }).sort({ startAt: 1 });

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
  }).sort({ createdAt: -1 });

  return events;
}

//getmyeventbyid
export async function getMyEventById(
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

  await event.deleteOne();
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