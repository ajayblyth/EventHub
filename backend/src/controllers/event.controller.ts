import type { Request, Response, NextFunction } from "express";

import {
  createEvent,
  getEvents, getEventById,
  updateEvent,
  deleteEvent, publishEvent,
  getMyEvents, getMyEventById,
} from "../services/event.service.js";

import AppError from "../utils/AppError.js";

//create 

export async function createEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = await createEvent(
      req.body,
      req.user!.userId
    );

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
}

//get all
export async function getEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const events = await getEvents();

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
}

//myevents
export async function getMyEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const events = await getMyEvents(req.user!.userId);

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
}

//get my event by id

export async function getMyEventByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id as string;

    if (!id) {
      throw new AppError("Event ID is required", 400);
    }

    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const event = await getMyEventById(
      id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
}


//get by id
export async function getEventByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
const event = await getEventById(req.params.id as string);
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
}

//patch
export async function updateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = await updateEvent(
      req.params.id as string,
      req.user!.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
}

//delete
export async function deleteEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteEvent(
      req.params.id as string,
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

//publish
export async function publishEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = await publishEvent(
      req.params.id as string,
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      message: "Event published successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
}

