import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { toast } from "react-toastify";
import {
  fetchMyEvents,
} from "../../store/slices/eventSlice";


import {
  deleteEvent,
  publishEvent,
} from "../../api/event.api";

import { Link } from "react-router-dom";

function MyEventsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { events, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(fetchMyEvents());
  }, [dispatch]);

  const handlePublish = async (id: string) => {
    try {
      await publishEvent(id);

      toast.success("Event published successfully!");

      dispatch(fetchMyEvents());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to publish event"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      await deleteEvent(id);

      toast.success("Event deleted successfully!");

      dispatch(fetchMyEvents());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete event"
      );
    }
  };

  if (isLoading) {
    return <p className="p-6">Loading your events...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-600">
        {error}
      </p>
    );
  }
return (
  <main className="mx-auto max-w-7xl px-6 py-8">

    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-brand-800">
        My Events
      </h1>

      <button
        onClick={() => navigate("/events/create")}
        className="rounded-lg bg-brand-500 px-5 py-2
                   font-semibold text-white
                   hover:bg-brand-600"
      >
        + Create Event
      </button>
    </div>

    {events.length === 0 ? (
      <p className="text-brand-900">
        You haven't created any events yet.
      </p>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {events.map((event) => {

          // Calculate total capacity
          const totalCapacity =
            event.ticketTiers?.reduce(
              (total, ticket) =>
                total + ticket.quantityTotal,
              0
            ) || 0;

          // Calculate total tickets sold
          const totalSold =
            event.ticketTiers?.reduce(
              (total, ticket) =>
                total + ticket.quantitySold,
              0
            ) || 0;

          // Calculate percentage full
          const percentFull =
            totalCapacity > 0
              ? Math.round(
                  (totalSold / totalCapacity) * 100
                )
              : 0;

          return (
            <div
              key={event._id}
              className="rounded-xl border border-brand-100
                         bg-white p-5 shadow-sm"
            >

              {/* Main Image */}
              {event.images &&
                event.images.length > 0 && (
                  <img
                    src={
                      event.images.find(
                        (image) => image.isMain
                      )?.url ||
                      event.images[0].url
                    }
                    alt={
                      event.images.find(
                        (image) => image.isMain
                      )?.alt ||
                      event.title
                    }
                    className="mb-4 h-40 w-full rounded-xl object-cover"
                  />
                )}

              <h2 className="text-xl font-semibold text-brand-800">
                {event.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {new Date(event.startAt).toLocaleString()}
              </p>

              <p className="mt-3 text-sm font-medium">
                Status:{" "}
                <span
                  className={
                    event.status === "DRAFT"
                      ? "text-yellow-600"
                      : event.status === "PUBLISHED"
                      ? "text-green-600"
                      : event.status === "COMPLETED"
                      ? "text-blue-600"
                      : event.status === "EXPIRED"
                      ? "text-gray-500"
                      : "text-red-600"
                  }
                >
                  {event.status}
                </span>
              </p>

              {/* Ticket Statistics */}
              <div className="mt-4 rounded-lg bg-brand-50 p-4">

                <p className="text-sm text-brand-700">
                  Tickets Sold
                </p>

                <p className="mt-1 text-lg font-bold text-brand-900">
                  {totalSold} / {totalCapacity}
                </p>

                <p className="mt-2 text-sm text-brand-600">
                  {percentFull}% Full
                </p>

              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-2">

                {/* Edit */}
                {(event.status === "DRAFT" ||
                  event.status === "PUBLISHED") && (
                  <button
                    onClick={() =>
                      navigate(
                        `/events/${event._id}/edit`
                      )
                    }
                    className="rounded-lg border border-brand-200
                               px-3 py-2 text-sm font-semibold
                               text-brand-800 hover:bg-brand-50"
                  >
                    Edit
                  </button>
                )}

                {/* Publish */}
                {event.status === "DRAFT" && (
                  <button
                    onClick={() =>
                      handlePublish(event._id)
                    }
                    className="rounded-lg bg-brand-500
                               px-3 py-2 text-sm font-semibold
                               text-white hover:bg-brand-600"
                  >
                    Publish
                  </button>
                )}

                {/* Delete */}
                {(event.status === "DRAFT" ||
                  event.status === "PUBLISHED") && (
                  <button
                    onClick={() =>
                      handleDelete(event._id)
                    }
                    className="rounded-lg border border-red-200
                               px-3 py-2 text-sm font-semibold
                               text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}

                {/* Attendees */}
                <Link
                  to={`/organizer/events/${event._id}/attendees`}
                  className="rounded-lg bg-brand-500
                             px-3 py-2 text-sm font-semibold
                             text-white hover:bg-brand-600"
                >
                  Attendees
                </Link>

              </div>
            </div>
          );
        })}

      </div>
    )}
  </main>
);
}

export default MyEventsPage;