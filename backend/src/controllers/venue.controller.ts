import type { Request, Response, NextFunction } from "express";
import {
  searchVenues,
  saveVenue,
} from "../services/venue.service.js";

export async function searchVenuesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const search = String(req.query.q || "");

    const venues = await searchVenues(search);

    res.status(200).json({
      success: true,
      venues,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveVenueController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const venue = await saveVenue(req.body);

    res.status(201).json({
      success: true,
      venue,
    });
  } catch (error) {
    next(error);
  }
}