import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchEvents } from "../../store/slices/eventSlice";

function EventsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery =
    searchParams.get("search")?.trim().toLowerCase() || "";

  const categorySlug =
    searchParams.get("category")?.trim().toLowerCase() || "";

  const selectedDate =
    searchParams.get("date") || "";

  const priceFilter =
    searchParams.get("price") || "all";

    const updateFilter = (
  key: string,
  value: string
) => {
  const params = new URLSearchParams(searchParams);

  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  setSearchParams(params);
};



  const { events, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery) ||
        event.summary?.toLowerCase().includes(searchQuery) ||
        event.description?.toLowerCase().includes(searchQuery);

      const matchesCategory =
        !categorySlug ||
        event.categoryIds?.some(
          (category) =>
            category.slug.toLowerCase() === categorySlug
        );

      const matchesDate =
        !selectedDate ||
        new Date(event.startAt)
          .toISOString()
          .split("T")[0] === selectedDate;


  const hasTicketTiers =
  event.ticketTiers?.length > 0;

const hasFreeTicket =
  hasTicketTiers &&
  event.ticketTiers.every(
    (ticket) => ticket.price === 0
  );

const hasPaidTicket =
  hasTicketTiers &&
  event.ticketTiers.some(
    (ticket) => ticket.price > 0
  );


      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && hasFreeTicket) ||
        (priceFilter === "paid" && hasPaidTicket);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDate &&
        matchesPrice
      );
    });
  }, [
    events,
    searchQuery,
    categorySlug,
    selectedDate,
    priceFilter,
  ]);

  if (isLoading) {
    return <p className="p-8 text-center">Loading events...</p>;
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
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-3xl font-bold text-brand-900">
          Discover Events
        </h1>

{/* Filters */}

{/* Filters */}

<div className="mb-4 flex flex-wrap items-center gap-3">

  {/* Date Filter */}

  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-600">
      📅
    </span>

    <input
      type="date"
      value={selectedDate}
      onChange={(event) => {
        updateFilter("date", event.target.value);
      }}
      className="h-10 rounded-lg border border-brand-100 bg-white
                 pl-9 pr-3 text-sm text-brand-900 shadow-sm
                 outline-none transition
                 hover:border-brand-300
                 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      aria-label="Filter by date"
    />
  </div>

  {/* Price Filter */}

  <select
    value={priceFilter}
    onChange={(event) => {
      const value =
        event.target.value === "all"
          ? ""
          : event.target.value;

      updateFilter("price", value);
    }}
    className="h-10 rounded-lg border border-brand-100 bg-white
               px-4 text-sm text-brand-900 shadow-sm
               outline-none transition
               hover:border-brand-300
               focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    aria-label="Filter by price"
  >
    <option value="all">Price</option>
    <option value="free">Free</option>
    <option value="paid">Paid</option>
  </select>

  {/* Clear Filters */}

  {(searchQuery ||
    categorySlug ||
    selectedDate ||
    priceFilter !== "all") && (
    <button
      type="button"
      onClick={() => navigate("/")}
      title="Clear all filters"
      aria-label="Clear all filters"
      className="flex h-10 w-10 items-center justify-center
                 rounded-lg border border-brand-100 bg-white
                 text-brand-600 shadow-sm transition
                 hover:border-brand-300 hover:bg-brand-50
                 hover:text-brand-900"
    >
      <X size={18} />
    </button>
  )}

</div>

{/* Active Filters */}

{(selectedDate || priceFilter !== "all") && (
  <div className="mb-8 flex flex-wrap gap-2">

    {selectedDate && (
      <button
        type="button"
        onClick={() => updateFilter("date", "")}
        className="flex items-center gap-2 rounded-full
                   bg-brand-100 px-3 py-1.5 text-sm
                   text-brand-800 transition hover:bg-brand-200"
      >
        📅 {new Date(selectedDate).toLocaleDateString()}
        <X size={14} />
      </button>
    )}

    {priceFilter !== "all" && (
      <button
        type="button"
        onClick={() => updateFilter("price", "")}
        className="flex items-center gap-2 rounded-full
                   bg-brand-100 px-3 py-1.5 text-sm
                   text-brand-800 transition hover:bg-brand-200"
      >
        💰 {priceFilter === "free" ? "Free" : "Paid"}
        <X size={14} />
      </button>
    )}

  </div>
)}



      

        {filteredEvents.length === 0 ? (
          <p className="text-brand-600">
            {searchQuery ||
            categorySlug ||
            selectedDate ||
            priceFilter !== "all"
              ? "No events found."
              : "No events available."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredEvents.map((event) => (
              <div
                key={event._id}
                onClick={() =>
                  navigate(`/events/${event._id}`)
                }
                className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm
                           transition hover:-translate-y-1 hover:shadow-md"
              >
                {event.images &&
                  event.images.length > 0 && (
                    <img
                      src={
                        event.images.find(
                          (image) => image.isMain
                        )?.url || event.images[0].url
                      }
                      alt={
                        event.images.find(
                          (image) => image.isMain
                        )?.alt || event.title
                      }
                      className="mb-4 h-48 w-full rounded-xl object-cover"
                    />
                  )}

                <h2 className="text-xl font-bold text-brand-900">
                  {event.title}
                </h2>

                <p className="mt-2 text-sm text-brand-600">
                  {event.summary || event.description}
                </p>

                <p className="mt-4 text-sm text-brand-600">
                  {new Date(event.startAt).toLocaleString()}
                </p>

                <p className="mt-2 font-semibold text-brand-500">
                  {event.isOnline
                    ? "Online Event"
                    : "In-person Event"}
                </p>
              </div>
            ))}

          </div>
        )}
      </div>
    </section>
  );
}

export default EventsPage;