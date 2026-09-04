import { useEffect, useState } from "react";
import api from "../../api/axios";

function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await api.get("/bookings/my-bookings");

        setBookings(response.data.bookings);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load bookings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking
        )
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to cancel booking"
      );
    }
  };

  if (isLoading) {
    return (
      <p className="p-8 text-center">
        Loading bookings...
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-8 text-center text-red-500">
        {error}
      </p>
    );
  }

  return (
    <section className="min-h-screen bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold text-brand-900">
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-brand-600">
              You don't have any bookings yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >

                <h2 className="text-xl font-bold text-brand-900">
                  {booking.eventId?.title || "Event"}
                </h2>

                <div className="mt-4 space-y-2">
                  {booking.tickets.map(
                    (ticket: any) => (
                      <div
                        key={ticket.ticketTierId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-brand-700">
                          {ticket.name} ×{" "}
                          {ticket.quantity}
                        </span>

                        <span className="font-semibold text-brand-800">
                          ₹{ticket.subtotal}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-4 flex justify-between border-t border-brand-100 pt-4">
                  <span className="font-semibold text-brand-900">
                    Total
                  </span>

                  <span className="font-bold text-brand-800">
                    ₹{booking.totalAmount}
                  </span>
                </div>

                <p className="mt-3 text-sm text-brand-600">
                  Status: {booking.status}
                </p>

                {booking.status === "CONFIRMED" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCancelBooking(booking._id)
                    }
                    className="mt-4 rounded-lg border border-red-200 px-4 py-2
                               text-sm font-semibold text-red-600
                               transition hover:bg-red-50"
                  >
                    Cancel Booking
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}

export default MyBookingsPage;