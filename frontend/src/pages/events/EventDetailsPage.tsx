
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../../api/event.api";

function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadEvent = async () => {
      try {
        const response = await getEventById(id);

        setEvent(response.event);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load event"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (isLoading) {
    return (
      <p className="p-8 text-center">
        Loading event...
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

  if (!event) {
    return (
      <p className="p-8 text-center">
        Event not found.
      </p>
    );
  }

  return (
    <section className="min-h-screen bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-brand-900">
          {event.title}
        </h1>

        {event.summary && (
          <p className="mt-3 text-lg text-brand-600">
            {event.summary}
          </p>
        )}

        <p className="mt-6 text-brand-700">
          {event.description}
        </p>

        <div className="mt-6 space-y-2 text-sm text-brand-700">

          <p>
            <strong>Starts:</strong>{" "}
            {new Date(event.startAt).toLocaleString()}
          </p>

          <p>
            <strong>Ends:</strong>{" "}
            {new Date(event.endAt).toLocaleString()}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {event.isOnline
              ? "Online Event"
              : "In-person Event"}
          </p>

        </div>

        {/* Event Images */}
<div className="mb-8">
  {event.images?.length > 0 ? (
    <>
      {/* Main Image */}
      <div className="overflow-hidden rounded-2xl">
        <img
          src={
            event.images.find((image: any) => image.isMain)?.url ||
            event.images[0].url
          }
          alt={
            event.images.find((image: any) => image.isMain)?.alt ||
            event.images[0].alt ||
            event.title
          }
          className="h-[400px] w-full object-cover"
        />
      </div>

      {/* Image Gallery */}
      {event.images.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {event.images.map((image: any) => (
            <img
              key={image.order}
              src={image.url}
              alt={image.alt || event.title}
              className="h-32 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </>
  ) : (
    <div className="flex h-[400px] items-center justify-center rounded-2xl bg-brand-100">
      <p className="text-brand-800">No event image available</p>
    </div>
  )}
</div>

        {event.ticketTiers?.length > 0 && (
          <div className="mt-8">

            <h2 className="mb-4 text-xl font-bold text-brand-900">
              Tickets
            </h2>

            <div className="space-y-3">

              {event.ticketTiers.map((ticket: any) => (
                <div
                  key={ticket.name}
                  className="rounded-lg border border-brand-100 p-4"
                >
                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-brand-900">
                      {ticket.name}
                    </span>

                    <span className="font-bold text-brand-800">
                      ₹{ticket.price}
                    </span>

                  </div>

                  {ticket.description && (
                    <p className="mt-1 text-sm text-brand-600">
                      {ticket.description}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-brand-600">
                    Available:{" "}
                    {ticket.quantityTotal - ticket.quantitySold}
                  </p>

                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default EventDetailsPage;

