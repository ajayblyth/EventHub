Better branch structure

You already have:

feature/authentication   ✅
feature/events           ✅
feature/security        ✅

For the remaining work, I'd use roughly 3 more feature branches:

Branch	Contains
feature/ticket-booking	Better My Bookings UI + Ticket Details + PDF ticket + QR code + booking confirmation email
feature/location	User location + nearby events + MongoDB geospatial search/filtering
feature/payment	Stripe TEST payment + successful payment → booking confirmation integration

So:

main
 │
 ├── feature/authentication  ✅ merged
 ├── feature/events          ✅ merged
 ├── feature/security        ✅ merged
 │
 ├── feature/ticket-booking  ⬅️ NEXT
 │      ├── Ticket details
 │      ├── PDF
 │      ├── QR
 │      └── confirmation email
 │
 ├── feature/location
 │
 └── feature/payment
What about small changes?

Don't create a branch for something like:

"Add Booking ID to card"

Just include it in the relevant feature branch:

feature/ticket-booking

Likewise:

"Add QR code"

"Change ticket UI"

"Add PDF button"

All can be commits within the same branch.

For example:

feature/ticket-booking

commit 1 → improve My Bookings UI
commit 2 → add Ticket Details
commit 3 → generate PDF ticket
commit 4 → add QR code
commit 5 → send confirmation email

===========================
Then we'll do:

Step 1 → Booking/Ticket data
Step 2 → My Bookings UI
Step 3 → Ticket details
Step 4 → PDF
Step 5 → Confirmation email
Step 6 → QR code
Step 7 → test everything
Step 8 → commit + merge into main
========================

qr code
----

Step 2 — What we'll build

For now, the QR will contain the booking identifier:

Booking ID
    ↓
QR Code
    ↓
TicketDetailsPage

Later, the same QR can be extended to support:

QR
 ↓
Booking ID
 ↓
Backend verification
 ↓
CONFIRMED / CANCELLED
 ↓
Check-in
 

 ---

We're not saving the QR code in MongoDB.

The flow will eventually be:

Booking ID
    ↓
generateBookingQrCode()
    ↓
QR image
    ↓
TicketDetailsPage

And later, the same QR can be put into the PDF ticket.


---
Install a Unicode font

In your backend terminal run:

npm install @fontsource/noto-sans

This gives us a proper font that can render ₹.

After it finishes, tell me done. Then I'll give you the complete replacement for ticketPdf.ts with the polished ticket design.