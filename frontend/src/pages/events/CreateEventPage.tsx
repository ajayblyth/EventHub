import {
  useState,
  useEffect,
  type SyntheticEvent,
} from "react";
import { toast } from "react-toastify";
import { searchVenues, saveVenue } from "../../api/venue.api";

import { useNavigate } from "react-router-dom";
import { createEvent, publishEvent } from "../../api/event.api";






function CreateEventPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    startAt: "",
    endAt: "",
    timezone: "Asia/Kolkata",
    isOnline: false,
    visibility: "PUBLIC",
    venueId: "",

    images: [
  {
    url: "",
    alt: "",
    isMain: true,
    order: 0,
  },
],

    ticketTiers: [
      {
        name: "General",
        description: "General entry",
        price: 500,
        currency: "INR",
        quantityTotal: 100,
        minPerOrder: 1,
        maxPerOrder: 10,
      },
    ],
  });

  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

const [venueSearch, setVenueSearch] = useState("");
const [venueSuggestions, setVenueSuggestions] = useState<any[]>([]);
const [selectedVenue, setSelectedVenue] = useState<any | null>(null);

 useEffect(() => {
    if (formData.isOnline || venueSearch.trim().length < 2) {
      setVenueSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const venues = await searchVenues(venueSearch);
        setVenueSuggestions(venues);
      } catch (error) {
        console.error("Failed to search venues:", error);
        setVenueSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
      }, [venueSearch, formData.isOnline]);



  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleImageChange = (
  index: number,
  field: "url" | "alt",
  value: string
) => {
  setFormData((prev) => ({
    ...prev,
    images: prev.images.map((image, imageIndex) =>
      imageIndex === index
        ? {
            ...image,
            [field]: value,
          }
        : image
    ),
  }));
};

const addImage = () => {
  setFormData((prev) => ({
    ...prev,
    images: [
      ...prev.images,
      {
        url: "",
        alt: "",
        isMain: false,
        order: prev.images.length,
      },
    ],
  }));
};

const removeImage = (index: number) => {
  setFormData((prev) => {
    const updatedImages = prev.images.filter(
      (_, imageIndex) => imageIndex !== index
    );

    // If the main image was removed, make the first image main
    if (
      prev.images[index]?.isMain &&
      updatedImages.length > 0
    ) {
      updatedImages[0].isMain = true;
    }

    return {
      ...prev,
      images: updatedImages.map((image, imageIndex) => ({
        ...image,
        order: imageIndex,
      })),
    };
  });
};

const setMainImage = (index: number) => {
  setFormData((prev) => ({
    ...prev,
    images: prev.images.map((image, imageIndex) => ({
      ...image,
      isMain: imageIndex === index,
    })),
  }));
};


const validateDateTime = () => {
  const start = new Date(formData.startAt);
  const end = new Date(formData.endAt);
  const now = new Date();

  if (start <= now) {
    toast.error("Event start time must be in the future.");
    return false;
  }

  if (end <= start) {
    toast.error("Event end time must be after the start time.");
    return false;
  }

  return true;
};

const handleSubmit = async (
  event: SyntheticEvent<HTMLFormElement>
) => {
  event.preventDefault();

    if (!validateDateTime()) {
    return;
  }
    try {
      const response = await createEvent(formData);

      setCreatedEventId(response.event._id);

toast.success("Event created successfully!");

} catch (error: any) {
      console.error(error);

      toast.error(
  error.response?.data?.message ||
    "Failed to create event"
);
    }
  };

  const handlePublish = async () => {
    if (!createdEventId) return;

    try {
      await publishEvent(createdEventId);

toast.success("Event published successfully!");

      navigate("/events");
    } catch (error: any) {
      console.error(error);

toast.error(
  error.response?.data?.message ||
    "Failed to publish event"
);

    }
  };
  return (
    <section className="min-h-screen bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="mb-8 text-3xl font-bold text-brand-900">
          Create Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Event Title */}
          <div>
            <label className="mb-2 block font-semibold">
              Event Title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
              placeholder="Bangalore Tech Meetup"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block font-semibold">
              Slug
            </label>

            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
              placeholder="bangalore-tech-meetup"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="mb-2 block font-semibold">
              Summary
            </label>

            <input
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
            />
          </div>

          {/* Date & Time */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-semibold">
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={formData.startAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                End Date & Time
              </label>

              <input
                type="datetime-local"
                name="endAt"
                value={formData.endAt}
                min={
                  formData.startAt ||
                  new Date().toISOString().slice(0, 16)
                }
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-brand-100 px-4 py-2"
              />
            </div>

          </div>

          {/* Event Type */}
          <div>
            <label className="mb-2 block font-semibold">
              Event Type
            </label>

            <select
              value={String(formData.isOnline)}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isOnline: event.target.value === "true",
                }))
              }
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
            >
              <option value="false">In-person</option>
              <option value="true">Online</option>
            </select>
          </div>

          {/* Venue */}
          {!formData.isOnline && (
            <div className="relative">
              <label className="mb-2 block font-semibold">
                Venue
              </label>

              <input
                type="text"
                value={
                  selectedVenue
                    ? `${selectedVenue.name}, ${selectedVenue.city}`
                    : venueSearch
                }
                onChange={(event) => {
                  setVenueSearch(event.target.value);
                  setSelectedVenue(null);

                  setFormData((prev) => ({
                    ...prev,
                    venueId: "",
                  }));
                }}
                placeholder="Search venue, e.g. Bangalore Palace"
                required={!formData.isOnline}
                className="w-full rounded-lg border border-brand-100 px-4 py-2"
              />

              {venueSuggestions.length > 0 && !selectedVenue && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-brand-100 bg-white shadow-lg">
                  {venueSuggestions.map((venue) => (
                    <button
                      key={venue.placeId}
                      type="button"
                      onClick={async () => {
                        try {
                          const savedVenue = await saveVenue(venue);

                          setSelectedVenue(savedVenue);
                          setVenueSearch("");
                          setVenueSuggestions([]);

                          setFormData((prev) => ({
                            ...prev,
                            venueId: savedVenue._id,
                          }));
                        } catch (error) {
                          console.error(
                            "Failed to save venue:",
                            error
                          );

                          toast.error(
                            "Failed to save venue. Please try again."
                          );
                        }
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-brand-50"
                    >
                      <p className="font-semibold text-brand-900">
                        {venue.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {venue.address}
                        {venue.city && `, ${venue.city}`}
                        {venue.state && `, ${venue.state}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* {selectedVenue && (
                <p className="mt-2 text-sm text-brand-800">
                  ✓ Selected: {selectedVenue.name}
                </p>
              )} */}

              {/* {!selectedVenue && venueSearch.length >= 2 && (
                <p className="mt-2 text-sm text-gray-500">
                  Select a venue from the suggestions.
                </p>
              )} */}
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="mb-2 block font-semibold">
              Visibility
            </label>

            <select
              value={formData.visibility}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  visibility: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-brand-100 px-4 py-2"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </div>

          {/* Event Images */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="font-semibold">
                Event Images
              </label>

              <button
                type="button"
                onClick={addImage}
                className="rounded-lg bg-brand-100 px-4 py-2 text-sm
                           font-semibold text-brand-900
                           hover:bg-brand-200"
              >
                + Add Image
              </button>
            </div>

            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-brand-100 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold text-brand-900">
                      Image {index + 1}
                    </p>

                    {image.isMain && (
                      <span
                        className="rounded-full bg-brand-100 px-3 py-1
                                   text-sm font-semibold text-brand-800"
                      >
                        Main Image
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">

                    <input
                      type="url"
                      value={image.url}
                      onChange={(event) =>
                        handleImageChange(
                          index,
                          "url",
                          event.target.value
                        )
                      }
                      placeholder="https://example.com/event-image.jpg"
                      className="w-full rounded-lg border border-brand-100 px-4 py-2"
                    />

                    <input
                      type="text"
                      value={image.alt}
                      onChange={(event) =>
                        handleImageChange(
                          index,
                          "alt",
                          event.target.value
                        )
                      }
                      placeholder="Image description"
                      className="w-full rounded-lg border border-brand-100 px-4 py-2"
                    />

                  </div>

                  <div className="mt-4 flex gap-3">

                    {!image.isMain && (
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className="rounded-lg border border-brand-300 px-4 py-2
                                   text-sm font-semibold text-brand-800
                                   hover:bg-brand-50"
                      >
                        Set as Main
                      </button>
                    )}

                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-lg border border-red-200 px-4 py-2
                                   text-sm font-semibold text-red-600
                                   hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Event */}
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 px-6 py-3
                       font-semibold text-white hover:bg-brand-600"
          >
            Create Event
          </button>

          {/* Publish Event */}
          {createdEventId && (
            <button
              type="button"
              onClick={handlePublish}
              className="w-full rounded-lg bg-brand-800 px-6 py-3
                         font-semibold text-white hover:bg-brand-900"
            >
              Publish Event
            </button>
          )}

        </form>
      </div>
    </section>
  );
}
export default CreateEventPage;