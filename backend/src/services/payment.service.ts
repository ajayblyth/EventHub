import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


// Create Razorpay Order
export async function createRazorpayOrder(
  amount: number,
  receipt: string
) {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
  });

  return order;
}


// Verify Razorpay Payment Signature
export function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    )
    .update(
      `${razorpayOrderId}|${razorpayPaymentId}`
    )
    .digest("hex");

  return generatedSignature === razorpaySignature;
}


// Fetch Razorpay Order
export async function fetchRazorpayOrder(
  orderId: string
) {
  const order = await razorpay.orders.fetch(orderId);

  return order;
}