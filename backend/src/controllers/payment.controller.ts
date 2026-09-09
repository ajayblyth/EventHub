import type { Request, Response, NextFunction } from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchRazorpayOrder,
} from "../services/payment.service.js";

import { createBooking } from "../services/booking.service.js";

import Event from "../models/Event.js";

import AppError from "../utils/AppError.js";


// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

export async function createPaymentOrderController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { eventId, tickets } = req.body;


    // 1. Validate eventId
    if (!eventId) {
      return next(
        new AppError(
          "Event ID is required",
          400
        )
      );
    }


    // 2. Validate tickets
    if (!tickets || tickets.length === 0) {
      return next(
        new AppError(
          "At least one ticket is required",
          400
        )
      );
    }


    // 3. Find event from database
    const event = await Event.findOne({
      _id: eventId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    });


    if (!event) {
      return next(
        new AppError(
          "Event not found",
          404
        )
      );
    }


    // 4. Check event date
    if (event.startAt <= new Date()) {
      return next(
        new AppError(
          "Tickets cannot be booked for this event",
          400
        )
      );
    }


    // 5. Calculate actual amount from database
    let totalAmount = 0;


    for (const selectedTicket of tickets) {

      const ticket = event.ticketTiers.find(
        (tier: any) =>
          tier._id.toString() ===
          selectedTicket.ticketTierId
      );


      if (!ticket) {
        return next(
          new AppError(
            "Ticket tier not found",
            404
          )
        );
      }


      // Check availability
      const available =
        ticket.quantityTotal -
        ticket.quantitySold;


      if (selectedTicket.quantity > available) {
        return next(
          new AppError(
            `Only ${available} ${ticket.name} tickets are available`,
            400
          )
        );
      }


      // Check min/max quantity
      if (
        selectedTicket.quantity < ticket.minPerOrder ||
        selectedTicket.quantity > ticket.maxPerOrder
      ) {
        return next(
          new AppError(
            `Invalid quantity for ${ticket.name}`,
            400
          )
        );
      }


      // Calculate amount using DATABASE price
      totalAmount +=
        ticket.price *
        selectedTicket.quantity;
    }


    // 6. Make sure amount is valid
    if (totalAmount <= 0) {
      return next(
        new AppError(
          "Invalid payment amount",
          400
        )
      );
    }


    // 7. Create Razorpay order
    const order = await createRazorpayOrder(
      totalAmount,
      `eventhub_${Date.now()}`
    );


    // 8. Send order information to frontend
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    next(error);
  }
}



// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export async function verifyPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      tickets,
    } = req.body;


    // 1. Validate Razorpay response
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return next(
        new AppError(
          "Payment verification details are missing",
          400
        )
      );
    }


    // 2. Validate eventId
    if (!eventId) {
      return next(
        new AppError(
          "Event ID is required",
          400
        )
      );
    }


    // 3. Validate tickets
    if (!tickets || tickets.length === 0) {
      return next(
        new AppError(
          "At least one ticket is required",
          400
        )
      );
    }


    // ==================================================
    // STEP A: VERIFY RAZORPAY SIGNATURE
    // ==================================================

    const isValid =
      verifyRazorpayPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );


    if (!isValid) {
      return next(
        new AppError(
          "Invalid payment signature",
          400
        )
      );
    }


    // ==================================================
    // STEP B: FETCH ORDER FROM RAZORPAY
    // ==================================================

    const razorpayOrder =
      await fetchRazorpayOrder(
        razorpay_order_id
      );


    // ==================================================
    // STEP C: FIND EVENT AGAIN
    // ==================================================

    const event = await Event.findOne({
      _id: eventId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    });


    if (!event) {
      return next(
        new AppError(
          "Event not found",
          404
        )
      );
    }


    // ==================================================
    // STEP D: CALCULATE EXPECTED AMOUNT
    // ==================================================

    let expectedAmount = 0;


    for (const selectedTicket of tickets) {

      const ticket = event.ticketTiers.find(
        (tier: any) =>
          tier._id.toString() ===
          selectedTicket.ticketTierId
      );


      if (!ticket) {
        return next(
          new AppError(
            "Ticket tier not found",
            404
          )
        );
      }


      expectedAmount +=
        ticket.price *
        selectedTicket.quantity;
    }


    // ==================================================
    // STEP E: COMPARE RAZORPAY AMOUNT
    // ==================================================

    const expectedAmountInPaise =
      Math.round(
        expectedAmount * 100
      );


    if (
      Number(razorpayOrder.amount) !==
      expectedAmountInPaise
    ) {
      return next(
        new AppError(
          "Payment amount does not match booking amount",
          400
        )
      );
    }


    // ==================================================
    // STEP F: CREATE BOOKING
    // ==================================================

    const booking = await createBooking(
      req.user!._id.toString(),
      eventId,
      tickets
    );


    // ==================================================
    // STEP G: SEND SUCCESS RESPONSE
    // ==================================================

    res.status(200).json({
      success: true,

      message:
        "Payment verified and booking confirmed",

      booking,
    });

  } catch (error) {
    next(error);
  }
}