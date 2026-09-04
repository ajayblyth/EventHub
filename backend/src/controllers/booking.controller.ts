import type  { Request, Response, NextFunction } from "express";
import { createBooking, getMyBookings, cancelBooking, getEventBookings } from "../services/booking.service.js";

export async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
const userId = req.user!.userId;

    const { eventId, tickets } = req.body;

    const booking = await createBooking(
      userId,
      eventId,
      tickets
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}


//get bookings

export async function getMyBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
const userId = req.user!.userId;

    const bookings = await getMyBookings(userId);

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;

    const booking = await cancelBooking(
      userId,
      req.params.id as string
    );

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}


export async function getEventBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user!.userId;

    const bookings = await getEventBookings(
      req.params.eventId as string,
      organizerId
    );

    res.status(200).json({
      bookings,
    });
  } catch (error) {
    next(error);
  }
}