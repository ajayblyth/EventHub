import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchEvents } from "../../store/slices/eventSlice";

function EventsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const searchQuery =
    searchParams.get("search")?.trim().toLowerCase() || "";

  const { events, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery) {
      return events;
    }

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery) ||
        event.summary?.toLowerCase().includes(searchQuery) ||
        event.description?.toLowerCase().includes(searchQuery)
    );
  }, [events, searchQuery]);

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

        {filteredEvents.length === 0 ? (
          <p className="text-brand-600">
            {searchQuery
              ? "No events found for your search."
              : "No events available."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="cursor-pointer rounded-2xl bg-white p-6 shadow-sm
                           transition hover:-translate-y-1 hover:shadow-md"
              >
                {event.images && event.images.length > 0 && (
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



/*

useDispatch
const dispatch = useDispatch<AppDispatch>();

dispatch is used to send an action to Redux.

Here:

dispatch(fetchEvents());

means:

"Redux, execute the fetchEvents async action."

So:

dispatch()
   ↓
sends action
   ↓
eventSlice
   ↓
fetchEvents()
   ↓
API call
useSelector
const { events, isLoading, error } = useSelector(
  (state: RootState) => state.events
);

useSelector is used to read data from Redux store.

Here we're reading:

state.events
   ↓
events
isLoading
error

So:

useDispatch → SEND something to Redux

useSelector → READ something from Redux

*/