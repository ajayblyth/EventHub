import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION!,
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL!,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    const result = await ses.send(command);

    console.log("SES EMAIL SENT:", result.MessageId);

    return result;
  } catch (error) {
    console.error("SES EMAIL ERROR:", error);
    throw new Error("Failed to send email");
  }
}

// Booking confirmation email
export async function sendBookingConfirmationEmail(
  to: string,
  booking: any
) {
  const event = booking.eventId;
  const venue = event?.venueId;

  const ticketRows = booking.tickets
    .map(
      (ticket: any) => `
        <tr>
          <td style="padding: 8px 0;">
            ${ticket.name} × ${ticket.quantity}
          </td>
          <td style="padding: 8px 0; text-align: right;">
            ₹${ticket.subtotal}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">

      <h2 style="color: #0f172a;">
        Booking Confirmed 🎉
      </h2>

      <p>
        Your booking has been successfully confirmed.
      </p>

      <h3>${event?.title || "Event"}</h3>

      <p>
        <strong>Date:</strong>
        ${
          event?.startAt
            ? new Date(event.startAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-"
        }
      </p>

      <p>
        <strong>Time:</strong>
        ${
          event?.startAt
            ? new Date(event.startAt).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "-"
        }
      </p>

      ${
        venue?.name
          ? `<p><strong>Venue:</strong> ${venue.name}</p>`
          : ""
      }

      <hr />

      <h3>Ticket Details</h3>

      <table style="width: 100%; border-collapse: collapse;">
        ${ticketRows}

        <tr>
          <td style="padding: 12px 0; font-weight: bold;">
            Total
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold;">
            ₹${booking.totalAmount}
          </td>
        </tr>
      </table>

      <hr />

      <p>
        <strong>Booking ID:</strong> ${booking._id}
      </p>

      <p>
        You can view your ticket and QR code from
        <strong>My Bookings</strong> in EventHub.
      </p>

      <p style="color: #64748b; font-size: 14px;">
        Thank you for booking with EventHub!
      </p>

    </div>
  `;

  return sendEmail(
    to,
    "Booking Confirmed - EventHub",
    html
  );
}

// Booking cancellation email
export async function sendBookingCancellationEmail(
  to: string,
  booking: any
) {
  const event = booking.eventId;
  const venue = event?.venueId;

  const ticketRows = booking.tickets
    .map(
      (ticket: any) => `
        <tr>
          <td style="padding: 8px 0;">
            ${ticket.name} × ${ticket.quantity}
          </td>
          <td style="padding: 8px 0; text-align: right;">
            ₹${ticket.subtotal}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #1e293b;">

      <h2 style="color: #0f172a;">
        Booking Cancelled
      </h2>

      <p>
        Your EventHub booking has been successfully cancelled.
      </p>

      <h3>${event?.title || "Event"}</h3>

      <p>
        <strong>Date:</strong>
        ${
          event?.startAt
            ? new Date(event.startAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-"
        }
      </p>

      <p>
        <strong>Time:</strong>
        ${
          event?.startAt
            ? new Date(event.startAt).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "-"
        }
      </p>

      ${
        venue?.name
          ? `<p><strong>Venue:</strong> ${venue.name}</p>`
          : ""
      }

      <hr />

      <h3>Cancelled Tickets</h3>

      <table style="width: 100%; border-collapse: collapse;">
        ${ticketRows}

        <tr>
          <td style="padding: 12px 0; font-weight: bold;">
            Total
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold;">
            ₹${booking.totalAmount}
          </td>
        </tr>
      </table>

      <hr />

      <p>
        <strong>Booking ID:</strong> ${booking._id}
      </p>

      <p style="color: #64748b; font-size: 14px;">
        Your tickets have been released back to the event inventory.
      </p>

      <p style="color: #64748b; font-size: 14px;">
        Thank you for using EventHub.
      </p>

    </div>
  `;

  return sendEmail(
    to,
    "Booking Cancelled - EventHub",
    html
  );
}