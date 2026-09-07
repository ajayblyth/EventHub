import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),

  tickets: z
    .array(
      z.object({
        ticketTierId: z.string().min(1, "Ticket tier ID is required"),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .positive("Quantity must be greater than 0"),
      })
    )
    .min(1, "At least one ticket is required"),
});