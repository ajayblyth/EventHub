import QRCode from "qrcode";

export async function generateBookingQrCode(
  bookingId: string
) {
  const qrCode = await QRCode.toDataURL(bookingId);

  return qrCode;
}