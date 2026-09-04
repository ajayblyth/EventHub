import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventBookings } from "../../api/bookingApi";

function EventAttendeesPage() {
  const { eventId } = useParams();

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getEventBookings(eventId);

        setBookings(data);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load attendees"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-brand-700">
          Loading attendees...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-900">
        Attendees
      </h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-brand-600">
          No bookings yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-brand-100
                         bg-white p-5 shadow-sm"
            >
              <div>
                <h2 className="font-semibold text-brand-900">
                  {booking.userId?.name}
                </h2>

                <p className="text-sm text-brand-600">
                  {booking.userId?.email}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                {booking.tickets.map((ticket: any) => (
                  <div
                    key={ticket.ticketTierId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-brand-700">
                      {ticket.name} × {ticket.quantity}
                    </span>

                    <span className="font-medium text-brand-900">
                      ₹{ticket.subtotal}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-brand-100 pt-3">
                <p className="text-sm font-semibold text-brand-900">
                  Total: ₹{booking.totalAmount}
                </p>

                <p className="mt-1 text-xs text-brand-600">
                  Status: {booking.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventAttendeesPage;