import { z } from "zod";

const ticketTierSchema = z
  .object({
    name: z.string().min(1, "Ticket name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price cannot be negative"),
    currency: z.literal("INR"),
    quantityTotal: z
      .number()
      .int()
      .min(1, "Quantity must be at least 1"),
    minPerOrder: z.number().int().min(1).default(1),
    maxPerOrder: z.number().int().min(1).default(10),
    salesStartAt: z.coerce.date().optional(),
    salesEndAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.maxPerOrder < data.minPerOrder) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPerOrder"],
        message:
          "Maximum tickets per order must be greater than or equal to minimum",
      });
    }

    if (
      data.salesStartAt &&
      data.salesEndAt &&
      data.salesEndAt <= data.salesStartAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salesEndAt"],
        message: "Sales end time must be after sales start time",
      });
    }
  });

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event title is required")
      .max(150),

    slug: z
      .string()
      .trim()
      .min(1, "Slug is required"),

    description: z
      .string()
      .min(1, "Event description is required"),

    summary: z
      .string()
      .max(300)
      .optional(),

    startAt: z.coerce.date(),

    endAt: z.coerce.date(),

    timezone: z
      .string()
      .default("Asia/Kolkata"),

    isOnline: z
      .boolean()
      .default(false),

    venueId: z.string().optional(),

    categoryIds: z
      .array(z.string())
      .optional(),

    tags: z
      .array(z.string())
      .optional(),

    visibility: z
      .enum(["PUBLIC", "PRIVATE", "UNLISTED"])
      .default("PUBLIC"),

    images: z
      .array(
        z.object({
          url: z.url(),
          alt: z.string().optional(),
          isMain: z.boolean().default(false),
          order: z.number().default(0),
        })
      )
      .optional(),

    ticketTiers: z
      .array(ticketTierSchema)
      .min(1, "At least one ticket tier is required"),
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    if (data.startAt <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Event start time must be in the future",
      });
    }

    if (data.endAt <= data.startAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Event end time must be after start time",
      });
    }
  });

export const updateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .optional(),

    slug: z
      .string()
      .trim()
      .min(1)
      .optional(),

    description: z
      .string()
      .trim()
      .min(1)
      .optional(),

    summary: z
      .string()
      .trim()
      .max(300)
      .optional(),

    startAt: z.coerce.date().optional(),

    endAt: z.coerce.date().optional(),

    timezone: z
      .string()
      .optional(),

    isOnline: z
      .boolean()
      .optional(),

    categoryIds: z
      .array(z.string())
      .optional(),

    tags: z
      .array(z.string())
      .optional(),

    visibility: z
      .enum(["PUBLIC", "PRIVATE", "UNLISTED"])
      .optional(),

    images: z
      .array(
        z.object({
          url: z.url(),
          alt: z.string().optional(),
          isMain: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .optional(),

 ticketTiers: z
  .array(
    z
      .object({
        name: z.string().trim().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        currency: z.literal("INR"),
        quantityTotal: z.number().int().min(1),
        minPerOrder: z.number().int().min(1).default(1),
        maxPerOrder: z.number().int().min(1).default(10),
        salesStartAt: z.coerce.date().optional(),
        salesEndAt: z.coerce.date().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.maxPerOrder < data.minPerOrder) {
          ctx.addIssue({
            code: "custom",
            path: ["maxPerOrder"],
            message:
              "Maximum tickets per order must be greater than or equal to minimum",
          });
        }

        if (
          data.salesStartAt &&
          data.salesEndAt &&
          data.salesEndAt <= data.salesStartAt
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["salesEndAt"],
            message: "Sales end time must be after sales start time",
          });
        }
      })
  )
  .optional(),
  
  })
  .superRefine((data, ctx) => {
    const now = new Date();

    if (data.startAt && data.startAt <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Event start time must be in the future",
      });
    }

    if (
      data.startAt &&
      data.endAt &&
      data.endAt <= data.startAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Event end time must be after start time",
      });
    }
  });



/*
Why update schema again?

Because these should not come from the client during an update:

organizerId ❌
status      ❌
_id         ❌
createdAt   ❌
updatedAt   ❌
*/

/*

why update schema again, Because these should not come from the client during an update:

organizerId ❌
status      ❌
_id         ❌
createdAt   ❌
updatedAt   ❌
*/