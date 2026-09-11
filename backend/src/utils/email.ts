import {
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
} from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION!,
});


// ============================================
// Normal email
// ============================================

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


// ============================================
// Email with PDF attachment
// ============================================

export async function sendEmailWithPdf(
  to: string,
  subject: string,
  html: string,
  pdfBuffer: Buffer,
  fileName: string
) {
  const boundary = `----EventHubBoundary${Date.now()}`;

  const rawMessage = [
    `From: ${process.env.SES_FROM_EMAIL!}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    html,
    "",
    `--${boundary}`,
    `Content-Type: application/pdf; name="${fileName}"`,
    `Content-Disposition: attachment; filename="${fileName}"`,
    `Content-Transfer-Encoding: base64`,
    "",
    pdfBuffer.toString("base64"),
    "",
    `--${boundary}--`,
  ].join("\r\n");

  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: Buffer.from(rawMessage),
    },
  });

  try {
    const result = await ses.send(command);

    console.log(
      "SES EMAIL WITH PDF SENT:",
      result.MessageId
    );

    return result;
  } catch (error) {
    console.error(
      "SES EMAIL WITH PDF ERROR:",
      error
    );

    throw new Error(
      "Failed to send email with PDF"
    );
  }
}


// ============================================
// Booking confirmation email
// ============================================

export async function sendBookingConfirmationEmail(
  to: string,
  booking: any,
  pdfBuffer?: Buffer
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
        Your ticket PDF is attached to this email.
        It contains your ticket details and QR code.
      </p>

      <p>
        You can also view your ticket from
        <strong>My Bookings</strong> in EventHub.
      </p>

      <p style="color: #64748b; font-size: 14px;">
        Thank you for booking with EventHub!
      </p>

    </div>
  `;


  // ============================================
  // If PDF exists → send attachment
  // ============================================

  if (pdfBuffer) {
 
    return sendEmailWithPdf(
      to,
      "Booking Confirmed - EventHub",
      html,
      pdfBuffer,
      `eventhub-ticket-${booking._id}.pdf`
    );
  }


  // ============================================
  // Fallback → normal email
  // ============================================

  return sendEmail(
    to,
    "Booking Confirmed - EventHub",
    html
  );
}


// ============================================
// Booking cancellation email
// ============================================

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
  <strong>Refund:</strong> ₹${booking.totalAmount} has been
  refunded to your original payment method.
</p>

<p>
  <strong>Booking ID:</strong> ${booking._id}
</p>

<p style="color: #64748b; font-size: 14px;">
  Your cancellation and refund have been processed successfully.
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
