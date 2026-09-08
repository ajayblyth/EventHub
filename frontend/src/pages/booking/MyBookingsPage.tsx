import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
 <section className="min-h-screen bg-brand-50 px-6 pt-4 pb-6">

  <div className="mx-auto max-w-5xl">

    {/* Page Header */}
<div className="mb-1 inline-block rounded-xl bg-brand-100 px-5 py-3">
        <h1 className="text-2xl font-bold tracking-tight text-brand-800">
        My Bookings
      </h1>
    </div>


        {bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-brand-600">
              You don't have any bookings yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {bookings.map((booking) => {
              const event = booking.eventId;

              return (
                <div
                  key={booking._id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >

                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-brand-100 p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-brand-900">
                        {event?.title || "Event"}
                      </h2>

                      <p className="mt-1 text-sm text-brand-500">
                        Booking ID: #{booking._id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Booking Information */}
                  <div className="border-b border-brand-100 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                        Event Date
                      </p>

                      <p className="mt-1 font-medium text-brand-900">
                        {event?.startAt
                          ? formatDate(event.startAt)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/my-bookings/${booking._id}`)
                      }
                      className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
                    >
                      View Ticket
                    </button>

                    {booking.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCancelBooking(booking._id)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default MyBookingsPage;
