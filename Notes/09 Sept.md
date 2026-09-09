# Razor pay

Event
 ↓
Select Tickets
 ↓
Checkout
 ↓
Create Razorpay Order
 ↓
Razorpay TEST Checkout
 ↓
User pays with TEST card / UPI
 ↓
Payment successful
 ↓
Verify payment on BACKEND
 ↓
Create/confirm Booking
 ↓
Confirmation Email
 ↓
QR + PDF

And failure:

Razorpay TEST Checkout
       ↓
Payment Failed
       ↓
NO CONFIRMED BOOKING
       ↓
User can try again

This is much more realistic than the current fake payment.

One important change to our existing booking system

Currently your booking service does:

createBooking()
     ↓
status = CONFIRMED
     ↓
quantitySold increases

We should not keep that exact flow with Razorpay.

Instead:

Create Razorpay Order
       ↓
Payment
       ↓
Backend verifies payment
       ↓
Create booking
       ↓
CONFIRMED

This is important because payment success must be verified server-side. We shouldn't trust only the frontend saying:

"Payment successful."

What you'll need

First we'll create/use a Razorpay account.

Then:

Razorpay Dashboard
       ↓
Test Mode
       ↓
API Keys
       ↓
Key ID
Key Secret
       ↓
backend .env

Something conceptually like:

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx

================

FakePaymentPage.tsx is the page we should convert into the real Razorpay payment page.

Your current page directly calls:

POST /api/bookings

when the user clicks Pay. That's the part we must remove, because currently it creates the booking before any real payment verification.

Razorpay's recommended flow is to create the Razorpay order first, open Checkout with that order_id, then send the successful payment details to your backend for signature verification.

What we're going to change
CheckoutPage
     ↓
FakePaymentPage
     ↓
POST /api/payments/create-order
     ↓
Razorpay TEST Checkout
     ↓
Successful payment
     ↓
Backend verifies signature
     ↓
Create CONFIRMED booking

==============
One more thing

Because TypeScript won't automatically know what Razorpay is, we'll add a small declaration for it.

But don't do that yet.

First make this index.html change and tell me done.

Then I'll give you the TypeScript declaration + the exact replacement for FakePaymentPage.tsx.

done

Perfect. ✅

Step 3B — Tell TypeScript about Razorpay

Create this file:

frontend/src/types/razorpay.d.ts