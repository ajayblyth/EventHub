✅ Already completed
Authentication: register/login/logout
JWT access + refresh tokens
Protected routes
Event creation
Ticket tiers
Venue search/save
Categories
Event editing
Publish event
My Events
Event discovery
Search
Category/date/free-paid filters
Event details
Multiple ticket selection
Checkout
Fake payment
Booking creation
My Bookings
Booking cancellation + inventory restoration
Organizer attendee list
Organizer ownership validation
Sold / total capacity / percentage-full display

Your use of Redux Toolkit for shared auth/event state is also aligned with Redux's recommended approach; local form/UI state can remain inside components.

===============
If an event has sold tickets, do not allow the organizer to simply delete it.

Real ticketing platforms treat cancellation and deletion differently. For example, Eventbrite cancels the event, notifies attendees, and requires orders to be refunded; deletion is a separate operation and completed orders must be handled first.

Best practice for our EventHub

Use this rule:

Event	Bookings	Organizer action
DRAFT	0	✅ Delete
PUBLISHED	0	✅ Delete
PUBLISHED	>0	❌ Delete → Cancel Event
COMPLETED	any	❌ Delete
CANCELLED	any	❌ Delete

When an organizer cancels an event that has bookings:

Organizer clicks Cancel Event
        ↓
Event → CANCELLED
        ↓
Stop further bookings
        ↓
Existing bookings → CANCELLED/REFUND_PENDING
        ↓
Paid bookings → refund
        ↓
Free bookings → simply cancelled
        ↓
Attendee sees event cancelled/refund status

For a real payment system, the refund should go through the payment provider back to the original payment method. Eventbrite follows this model, and Stripe supports refunds against the original payment.

But we have Fake Payment right now

This is important.

We should NOT build a fake refund system pretending money was actually returned.

For our current OJT version:

Fake Payment
     ↓
Booking CONFIRMED

If organizer cancels:

Event → CANCELLED
Booking → CANCELLED
Refund status → REFUND_PENDING / REFUNDED

But because no real money was actually charged, we can display:

Refund processed (demo)

Later, when we add Stripe TEST mode, we replace that with the actual Stripe refund API.

Therefore, I recommend changing our plan

Instead of:

Delete event

we should have:

DRAFT + no bookings
        → Delete

PUBLISHED + no bookings
        → Delete OR Cancel

PUBLISHED + bookings
        → Cancel Event

And never physically delete an event that has booking history. Keeping the event and booking records is much better for audit/history.

So yes, event cancellation should be our next requirement before capacity editing, because it affects how Delete should work.

We can implement it step-by-step starting with the backend cancellation service.