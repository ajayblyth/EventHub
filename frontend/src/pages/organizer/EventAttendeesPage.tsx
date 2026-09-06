import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventBookings } from "../../api/bookingApi";

function EventAttendeesPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getEventBookings(eventId);
        console.log("ATTENDEE DATA:", data);

        setEvent(data.event);
        setBookings(data.bookings);
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


  const filteredBookings = bookings.filter((booking) => {
  const searchText = search.toLowerCase();

  const fullName =
    `${booking.userId?.firstName || ""} ${booking.userId?.lastName || ""}`
      .toLowerCase();

  const email =
    booking.userId?.email?.toLowerCase() || "";

  const matchesSearch =
    fullName.includes(searchText) ||
    email.includes(searchText);

  const matchesStatus =
    statusFilter === "ALL" ||
    booking.status === statusFilter;

  return matchesSearch && matchesStatus;
});

return (
  <div className="mx-auto max-w-6xl px-6 py-4">

    {/* Event Header */}
    <div className="sticky top-0 z-10 -mx-6 mb-3 border-b border-brand-100 bg-white/95 px-6 py-3 backdrop-blur">
      <p className="text-sm font-medium text-brand-600">
        Attendees
      </p>

      <h1 className="mt-0.5 text-xl font-bold text-brand-900">
        {event?.title || "Event"}
      </h1>
    </div>

    {/* Booking Summary */}
    <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-brand-100 bg-brand-50 px-5 py-3">
      <div>
        <span className="text-sm text-brand-600">
          Confirmed
        </span>

        <span className="ml-2 font-bold text-green-700">
          {
            bookings.filter(
              (booking) =>
                booking.status === "CONFIRMED"
            ).length
          }
        </span>
      </div>

      <div className="hidden h-5 w-px bg-brand-200 sm:block" />

      <div>
        <span className="text-sm text-brand-600">
          Cancelled
        </span>

        <span className="ml-2 font-bold text-red-700">
          {
            bookings.filter(
              (booking) =>
                booking.status === "CANCELLED"
            ).length
          }
        </span>
      </div>

      <div className="hidden h-5 w-px bg-brand-200 sm:block" />

      <div>
        <span className="text-sm text-brand-600">
          Total
        </span>

        <span className="ml-2 font-bold text-brand-900">
          {bookings.length}
        </span>
      </div>
    </div>

    {/* Search and Filter */}
    <div className="mb-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
      />

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="rounded-lg border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
      >
        <option value="ALL">
          All Status
        </option>

        <option value="CONFIRMED">
          Confirmed
        </option>

        <option value="CANCELLED">
          Cancelled
        </option>
      </select>
    </div>

    {/* Attendee List */}
    {bookings.length === 0 ? (
      <p className="text-brand-600">
        No bookings yet.
      </p>
    ) : filteredBookings.length === 0 ? (
      <p className="text-brand-600">
        No bookings match your search or filter.
      </p>
    ) : (
      <div className="space-y-3">
        {filteredBookings.map((booking) => (
          <div
            key={booking._id}
            className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            {/* Attendee + Status */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold text-brand-900">
                  {booking.userId?.firstName}{" "}
                  {booking.userId?.lastName}
                </h2>

                <p className="text-sm text-brand-600">
                  {booking.userId?.email}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  booking.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : booking.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.status}
              </span>
            </div>

            {/* Tickets */}
            <div className="mt-3 border-t border-brand-100 pt-3">
              <div className="space-y-1.5">
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

              {/* Total */}
              <div className="mt-3 flex justify-between border-t border-brand-100 pt-3">
                <span className="text-sm font-semibold text-brand-700">
                  Total
                </span>

                <span className="text-sm font-bold text-brand-900">
                  ₹{booking.totalAmount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
export default EventAttendeesPage;