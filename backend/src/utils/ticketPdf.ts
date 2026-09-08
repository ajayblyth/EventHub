import PDFDocument from "pdfkit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateBookingQrCode } from "./qrCode.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = path.join(__dirname, "../../fonts/NotoSans-Regular.ttf");
const boldFontPath = path.join(__dirname, "../../fonts/NotoSans-Bold.ttf");

export async function generateTicketPdf(booking: any) {
  const margin = 50;
  const pageWidth = 595.28; // Standard A4 width in pt
  const contentWidth = pageWidth - margin * 2; // 495.28 pt
  const rightEdge = margin + contentWidth;

  const doc = new PDFDocument({
    size: "A4",
    margin,
  });

  const event = booking.eventId;
  const venue = event?.venueId;

  const qrCode = await generateBookingQrCode(booking._id.toString());

  const drawDivider = () => {
    doc.moveDown(0.8);
    const lineY = doc.y;
    doc
      .strokeColor("#E2E8F0")
      .lineWidth(1)
      .moveTo(margin, lineY)
      .lineTo(rightEdge, lineY)
      .stroke();
    doc.y = lineY + 14;
  };

  // Header Brand
  doc
    .font(boldFontPath)
    .fontSize(24)
    .fillColor("#0F172A")
    .text("EventHub", margin, doc.y, {
      width: contentWidth,
      align: "center",
    });

  doc
    .font(fontPath)
    .fontSize(9)
    .fillColor("#64748B")
    .text("EVENT TICKET", margin, doc.y, {
      width: contentWidth,
      align: "center",
      characterSpacing: 2,
    });

  drawDivider();

  // Event Title
  doc
    .font(boldFontPath)
    .fontSize(20)
    .fillColor("#0F172A")
    .text(event?.title || "Event", margin, doc.y, {
      width: contentWidth,
      align: "center",
    });

  doc.moveDown(0.8);

  // Date, Time & Venue
  const startDate = event?.startAt ? new Date(event.startAt) : null;
  const endDate = event?.endAt ? new Date(event.endAt) : null;

  if (startDate) {
    doc.font(boldFontPath).fontSize(8.5).fillColor("#64748B").text("DATE", margin);
    doc
      .font(fontPath)
      .fontSize(11)
      .fillColor("#1E293B")
      .text(
        startDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        margin
      );

    doc.moveDown(0.4);

    doc.font(boldFontPath).fontSize(8.5).fillColor("#64748B").text("TIME", margin);

    const startTime = startDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = endDate
      ? endDate.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

    doc
      .font(fontPath)
      .fontSize(11)
      .fillColor("#1E293B")
      .text(endTime ? `${startTime} – ${endTime}` : startTime, margin);
  }

  doc.moveDown(0.4);

  if (venue?.name) {
    doc.font(boldFontPath).fontSize(8.5).fillColor("#64748B").text("VENUE", margin);
    doc.font(fontPath).fontSize(11).fillColor("#1E293B").text(venue.name, margin);

    if (venue.address) {
      doc
        .font(fontPath)
        .fontSize(9.5)
        .fillColor("#64748B")
        .text(venue.address, margin, doc.y, { width: contentWidth });
    }
  }

  drawDivider();

  // Tickets Section
  doc.font(boldFontPath).fontSize(12).fillColor("#0F172A").text("TICKETS", margin);
  doc.moveDown(0.5);

  const priceColWidth = 100;
  const nameColWidth = contentWidth - priceColWidth;

  for (const ticket of booking.tickets) {
    const rowY = doc.y;

    doc
      .font(fontPath)
      .fontSize(10.5)
      .fillColor("#334155")
      .text(`${ticket.name} × ${ticket.quantity}`, margin, rowY, {
        width: nameColWidth,
      });

    doc
      .font(fontPath)
      .fontSize(10.5)
      .fillColor("#334155")
    .text(`₹${ticket.subtotal}`, margin + nameColWidth, rowY, {
        width: priceColWidth,
        align: "right",
      });

    doc.y = rowY + 18;
  }

  // Sub-divider for Total
  const subDividerY = doc.y + 4;
  doc
    .strokeColor("#E2E8F0")
    .lineWidth(0.8)
    .moveTo(margin + 260, subDividerY)
    .lineTo(rightEdge, subDividerY)
    .stroke();

  const totalRowY = subDividerY + 8;
  doc
    .font(boldFontPath)
    .fontSize(12)
    .fillColor("#0F172A")
    .text("Total", margin, totalRowY, {
      width: nameColWidth,
      align: "right",
    });

  doc
    .font(boldFontPath)
    .fontSize(12)
    .fillColor("#0F172A")
    .text(`₹${booking.totalAmount}`, margin + nameColWidth, totalRowY, {
      width: priceColWidth,
      align: "right",
    });

  doc.y = totalRowY + 18;

  drawDivider();

  // -------------------------------------------------------------
  // Production Two-Column Verification Box (Booking Info + QR)
  // -------------------------------------------------------------
  const sectionStartY = doc.y + 6;
  const columnGap = 20;
  const leftColWidth = 280;
  const rightColWidth = contentWidth - leftColWidth - columnGap; // ~195 pt
  const rightColX = margin + leftColWidth + columnGap;

  // Background card for better visual grouping
  doc
    .rect(margin, sectionStartY, contentWidth, 160)
    .fillColor("#F8FAFC")
    .fill();

  // LEFT COLUMN: Booking Metadata
  let leftY = sectionStartY + 16;
  const leftInnerMargin = margin + 16;

  doc
    .font(boldFontPath)
    .fontSize(8)
    .fillColor("#64748B")
    .text("BOOKING ID", leftInnerMargin, leftY);

  leftY += 12;
  doc
    .font(fontPath)
    .fontSize(9.5)
    .fillColor("#0F172A")
    .text(booking._id.toString(), leftInnerMargin, leftY);

  leftY += 22;
  doc
    .font(boldFontPath)
    .fontSize(8)
    .fillColor("#64748B")
    .text("BOOKED ON", leftInnerMargin, leftY);

  leftY += 12;
  doc
    .font(fontPath)
    .fontSize(9.5)
    .fillColor("#0F172A")
    .text(
      new Date(booking.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      leftInnerMargin,
      leftY
    );

  leftY += 22;
  doc
    .font(boldFontPath)
    .fontSize(8)
    .fillColor("#64748B")
    .text("STATUS", leftInnerMargin, leftY);

  leftY += 12;
  const isConfirmed = booking.status === "CONFIRMED";
  doc
    .font(boldFontPath)
    .fontSize(9.5)
    .fillColor(isConfirmed ? "#16A34A" : "#DC2626")
    .text(booking.status, leftInnerMargin, leftY);

  // RIGHT COLUMN: QR Code & Scan Instructions
  const qrSize = 92;
  const qrX = rightColX + (rightColWidth - qrSize) / 2;
  const qrY = sectionStartY + 14;

  doc.image(qrCode, qrX, qrY, {
    width: qrSize,
    height: qrSize,
  });

  const scanLabelY = qrY + qrSize + 8;
  doc
    .font(boldFontPath)
    .fontSize(9.5)
    .fillColor("#0F172A")
    .text("Scan at entrance", rightColX, scanLabelY, {
      width: rightColWidth,
      align: "center",
    });

  doc
    .font(fontPath)
    .fontSize(7.5)
    .fillColor("#64748B")
    .text("Present this digital pass at the gate", rightColX, scanLabelY + 12, {
      width: rightColWidth,
      align: "center",
    });

  doc.end();
  return doc;
}