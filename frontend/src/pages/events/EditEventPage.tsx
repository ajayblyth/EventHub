import {
    useEffect,
    useState,
    type ChangeEvent,
    type SyntheticEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    getMyEventById,
    updateEvent,
} from "../../api/event.api";

import { getCategories } from "../../api/category.api";

import {
    searchVenues,
    saveVenue,
} from "../../api/venue.api";

type TicketTier = {
    name: string;
    description: string;
    price: string | number;
    currency: string;
    quantityTotal: number;
    minPerOrder: number;
    maxPerOrder: number;
};

type ImageData = {
    url: string;
    alt?: string;
    isMain: boolean;
    order: number;
};

function EditEventPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<{
        title: string;
        slug: string;
        summary: string;
        description: string;
        startAt: string;
        endAt: string;
        timezone: string;
        isOnline: boolean;
        venueId: string;
        visibility: string;
        categoryIds: string[];
        tags: string[];
        images: ImageData[];
        ticketTiers: TicketTier[];
    }>({
        title: "",
        slug: "",
        summary: "",
        description: "",
        startAt: "",
        endAt: "",
        timezone: "Asia/Kolkata",

        isOnline: false,
        venueId: "",

        visibility: "PUBLIC",

        categoryIds: [],
        tags: [],

        images: [],

        ticketTiers: [
            {
                name: "",
                description: "",
                price: "",
                currency: "INR",
                quantityTotal: 1,
                minPerOrder: 1,
                maxPerOrder: 10,
            },
        ],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);

  const [venueSearch, setVenueSearch] = useState("");

const [venueSuggestions, setVenueSuggestions] = useState<any[]>([]);

const [selectedVenue, setSelectedVenue] = useState<any | null>(
    null
);

const [isVenueSearching, setIsVenueSearching] = useState(false);

    // -----------------------------
    // Load categories
    // -----------------------------

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error(
                    "Failed to load categories:",
                    error
                );

                toast.error("Failed to load categories");
            }
        };

        loadCategories();
    }, []);

    // -----------------------------
    // Search venues
    // -----------------------------
useEffect(() => {
    if (
        formData.isOnline ||
        !isVenueSearching ||
        venueSearch.trim().length < 2
    ) {
        setVenueSuggestions([]);
        return;
    }

    const timer = setTimeout(async () => {
        try {
            const venues = await searchVenues(
                venueSearch
            );

            setVenueSuggestions(venues);
        } catch (error) {
            console.error(
                "Failed to search venues:",
                error
            );

            setVenueSuggestions([]);
        }
    }, 300);

    return () => clearTimeout(timer);
}, [
    venueSearch,
    formData.isOnline,
    isVenueSearching,
]);
    // -----------------------------
    // Load existing event
    // -----------------------------

    useEffect(() => {
        if (!id) return;

        const loadEvent = async () => {
            try {
                const response = await getMyEventById(id);
                const event = response.event;

                setFormData({
                    title: event.title || "",
                    slug: event.slug || "",
                    summary: event.summary || "",
                    description: event.description || "",

                    startAt: event.startAt
                        ? new Date(event.startAt)
                              .toISOString()
                              .slice(0, 16)
                        : "",

                    endAt: event.endAt
                        ? new Date(event.endAt)
                              .toISOString()
                              .slice(0, 16)
                        : "",

                    timezone:
                        event.timezone || "Asia/Kolkata",

                    isOnline: event.isOnline || false,

                    venueId:
                        typeof event.venueId === "object"
                            ? event.venueId?._id || ""
                            : event.venueId || "",

                    visibility:
                        event.visibility || "PUBLIC",

                    categoryIds:
                        event.categoryIds?.map(
                            (category: any) =>
                                typeof category === "object"
                                    ? category._id
                                    : category
                        ) || [],

                    tags: event.tags || [],

                    images: event.images || [],

                    ticketTiers: (
                        event.ticketTiers || []
                    ).map((tier: any) => ({
                        name: tier.name || "",
                        description:
                            tier.description || "",
                        price: tier.price ?? "",
                        currency:
                            tier.currency || "INR",
                        quantityTotal:
                            tier.quantityTotal ?? 1,
                        minPerOrder:
                            tier.minPerOrder ?? 1,
                        maxPerOrder:
                            tier.maxPerOrder ?? 10,
                    })),
                });

                // Existing venue
                if (
                    event.venueId &&
                    typeof event.venueId === "object"
                ) {
                    setSelectedVenue(event.venueId);

                    setVenueSearch(
                        event.venueId.name || ""
                    );
                }
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ||
                        "Failed to load event"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadEvent();
    }, [id]);

    // -----------------------------
    // General input change
    // -----------------------------

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // -----------------------------
    // Venue search change
    // -----------------------------

const handleVenueSearchChange = (
    event: ChangeEvent<HTMLInputElement>
) => {
    const value = event.target.value;

    setVenueSearch(value);

    setIsVenueSearching(true);

    setSelectedVenue(null);

    setFormData((prev) => ({
        ...prev,
        venueId: "",
    }));
};

    // -----------------------------
    // Select venue
    // -----------------------------

    const handleVenueSelect = async (
        venue: any
    ) => {
        try {
            const savedVenue = await saveVenue(venue);

            setSelectedVenue(savedVenue);

            setVenueSearch(
                savedVenue.name || venue.name || ""
            );

            setFormData((prev) => ({
                ...prev,
                venueId: savedVenue._id,
            }));

            setVenueSuggestions([]);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to select venue"
            );
        }
    };

    // -----------------------------
    // Image change
    // -----------------------------

    const handleImageChange = (
        index: number,
        field: "url" | "alt",
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,

            images: prev.images.map(
                (image, imageIndex) =>
                    imageIndex === index
                        ? {
                              ...image,
                              [field]: value,
                          }
                        : image
            ),
        }));
    };

    // -----------------------------
    // Ticket change
    // -----------------------------

    const handleTicketChange = (
        index: number,
        field:
            | "name"
            | "description"
            | "price"
            | "quantityTotal"
            | "minPerOrder"
            | "maxPerOrder",
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,

            ticketTiers: prev.ticketTiers.map(
                (tier, tierIndex) =>
                    tierIndex === index
                        ? {
                              ...tier,

                              [field]:
                                  field === "name" ||
                                  field ===
                                      "description"
                                      ? value
                                      : value === ""
                                        ? ""
                                        : Number(value),
                          }
                        : tier
            ),
        }));
    };

    // -----------------------------
    // Add ticket tier
    // -----------------------------

    const addTicketTier = () => {
        setFormData((prev) => ({
            ...prev,

            ticketTiers: [
                ...prev.ticketTiers,
                {
                    name: "",
                    description: "",
                    price: "",
                    currency: "INR",
                    quantityTotal: 1,
                    minPerOrder: 1,
                    maxPerOrder: 10,
                },
            ],
        }));
    };

    // -----------------------------
    // Remove ticket tier
    // -----------------------------

    const removeTicketTier = (
        index: number
    ) => {
        setFormData((prev) => ({
            ...prev,

            ticketTiers:
                prev.ticketTiers.filter(
                    (_, tierIndex) =>
                        tierIndex !== index
                ),
        }));
    };

    // -----------------------------
    // Add image
    // -----------------------------

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

    // -----------------------------
    // Remove image
    // -----------------------------

    const removeImage = (
        index: number
    ) => {
        setFormData((prev) => {
            const updatedImages =
                prev.images.filter(
                    (_, imageIndex) =>
                        imageIndex !== index
                );

            if (
                prev.images[index]?.isMain &&
                updatedImages.length > 0
            ) {
                updatedImages[0].isMain = true;
            }

            return {
                ...prev,

                images: updatedImages.map(
                    (image, imageIndex) => ({
                        ...image,
                        order: imageIndex,
                    })
                ),
            };
        });
    };

    // -----------------------------
    // Set main image
    // -----------------------------

    const setMainImage = (
        index: number
    ) => {
        setFormData((prev) => ({
            ...prev,

            images: prev.images.map(
                (image, imageIndex) => ({
                    ...image,
                    isMain:
                        imageIndex === index,
                })
            ),
        }));
    };

    // -----------------------------
    // Submit
    // -----------------------------

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!id) return;

        const start = new Date(
            formData.startAt
        );

        const end = new Date(
            formData.endAt
        );

        const now = new Date();

        if (start <= now) {
            toast.error(
                "Event start time must be in the future."
            );
            return;
        }

        if (end <= start) {
            toast.error(
                "Event end time must be after the start time."
            );
            return;
        }

        if (
            !formData.isOnline &&
            !formData.venueId
        ) {
            toast.error(
                "Please select a venue."
            );
            return;
        }

        if (
            formData.categoryIds.length === 0
        ) {
            toast.error(
                "Please select a category."
            );
            return;
        }

        for (const tier of formData.ticketTiers) {
            if (!tier.name.trim()) {
                toast.error(
                    "Ticket name is required."
                );
                return;
            }

            if (
                tier.price === "" ||
                Number(tier.price) < 0
            ) {
                toast.error(
                    `Please enter a valid price for ${
                        tier.name
                    }.`
                );
                return;
            }

            if (
                tier.quantityTotal < 1
            ) {
                toast.error(
                    `Ticket quantity must be at least 1 for ${
                        tier.name
                    }.`
                );
                return;
            }

            if (
                tier.minPerOrder < 1
            ) {
                toast.error(
                    `Minimum tickets per order must be at least 1 for ${
                        tier.name
                    }.`
                );
                return;
            }

            if (
                tier.maxPerOrder <
                tier.minPerOrder
            ) {
                toast.error(
                    `Maximum tickets per order must be greater than or equal to minimum for ${
                        tier.name
                    }.`
                );
                return;
            }
        }

        try {
            setIsSaving(true);

            await updateEvent(
                id,
                formData
            );

            toast.success(
                "Event updated successfully!"
            );

            navigate(
                "/events/my-events"
            );
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to update event"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // -----------------------------
    // Loading
    // -----------------------------

    if (isLoading) {
        return (
            <p className="p-8 text-center">
                Loading event...
            </p>
        );
    }
    return (
        <section className="min-h-screen bg-brand-50 px-6 py-12">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">

                <h1 className="mb-8 text-3xl font-bold text-brand-900">
                    Edit Event
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

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

                    {/* Date / Time */}

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block font-semibold">
                                Start Date & Time
                            </label>

                            <input
                                type="datetime-local"
                                name="startAt"
                                value={formData.startAt}
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
                                    isOnline:
                                        event.target.value === "true",
                                }))
                            }
                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                        >
                            <option value="false">
                                In-person
                            </option>

                            <option value="true">
                                Online
                            </option>
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
                                value={venueSearch}
                                onChange={handleVenueSearchChange}
                                placeholder="Search venue"
                                className="w-full rounded-lg border border-brand-100 px-4 py-2"
                            />

                            {selectedVenue && (
                                <p className="mt-2 text-sm text-brand-700">
                                    Selected:{" "}
                                    <span className="font-semibold">
                                        {selectedVenue.name}
                                    </span>

                                    {selectedVenue.city &&
                                        `, ${selectedVenue.city}`}
                                </p>
                            )}

                            {venueSuggestions.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-brand-100 bg-white shadow-lg">

                                    {venueSuggestions.map((venue) => (
                                        <button
                                            type="button"
                                            key={venue._id}
                                            onClick={() =>
                                                handleVenueSelect(venue)
                                            }
                                            className="block w-full px-4 py-3 text-left hover:bg-brand-50"
                                        >
                                            <p className="font-semibold text-brand-900">
                                                {venue.name}
                                            </p>

                                            {venue.city && (
                                                <p className="text-sm text-gray-500">
                                                    {venue.city}
                                                </p>
                                            )}
                                        </button>
                                    ))}

                                </div>
                            )}

                        </div>
                    )}

                    {/* Images */}

                    <div>

                        <div className="mb-3 flex items-center justify-between">

                            <label className="font-semibold">
                                Event Images
                            </label>

                            <button
                                type="button"
                                onClick={addImage}
                                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-200"
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
                                            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
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
                                            value={image.alt || ""}
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
                                                onClick={() =>
                                                    setMainImage(index)
                                                }
                                                className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                                            >
                                                Set as Main
                                            </button>
                                        )}

                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        )}

                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>

                    {/* Ticket Tiers */}

                    <div>

                        <div className="mb-3 flex items-center justify-between">

                            <label className="font-semibold">
                                Ticket Tiers
                            </label>

                            <button
                                type="button"
                                onClick={addTicketTier}
                                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-200"
                            >
                                + Add Ticket Tier
                            </button>

                        </div>

                        <div className="space-y-5">

                            {formData.ticketTiers.map((tier, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-brand-100 p-5"
                                >

                                    <div className="mb-4 flex items-center justify-between">

                                        <h3 className="font-semibold text-brand-900">
                                            Ticket Tier {index + 1}
                                        </h3>

                                        {formData.ticketTiers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTicketTier(index)
                                                }
                                                className="text-sm font-semibold text-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}

                                    </div>

                                    <div className="space-y-4">

                                        {/* Name */}

                                        <input
                                            type="text"
                                            value={tier.name}
                                            onChange={(event) =>
                                                handleTicketChange(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ticket name"
                                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                        />

                                        {/* Description */}

                                        <textarea
                                            value={tier.description}
                                            onChange={(event) =>
                                                handleTicketChange(
                                                    index,
                                                    "description",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ticket description"
                                            rows={3}
                                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                        />

                                        {/* Price / Quantity / Min */}

                                        <div className="grid gap-4 md:grid-cols-3">

                                            <input
                                                type="number"
                                                min="0"
                                                value={tier.price}
                                                onChange={(event) =>
                                                    handleTicketChange(
                                                        index,
                                                        "price",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Price"
                                                className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                            />

                                            <input
                                                type="number"
                                                min="1"
                                                value={tier.quantityTotal}
                                                onChange={(event) =>
                                                    handleTicketChange(
                                                        index,
                                                        "quantityTotal",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Total quantity"
                                                className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                            />

                                            <input
                                                type="number"
                                                min="1"
                                                value={tier.minPerOrder}
                                                onChange={(event) =>
                                                    handleTicketChange(
                                                        index,
                                                        "minPerOrder",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Min per order"
                                                className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                            />

                                        </div>

                                        {/* Max */}

                                        <div className="grid gap-4 md:grid-cols-3">

                                            <input
                                                type="number"
                                                min="1"
                                                value={tier.maxPerOrder}
                                                onChange={(event) =>
                                                    handleTicketChange(
                                                        index,
                                                        "maxPerOrder",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Max per order"
                                                className="w-full rounded-lg border border-brand-100 px-4 py-2"
                                            />

                                        </div>

                                        <p className="text-sm text-gray-500">
                                            Currency: INR
                                        </p>

                                    </div>

                                </div>
                            ))}

                        </div>
                    </div>

                    {/* Categories */}

                    <div>

                        <label className="mb-2 block font-semibold">
                            Category
                        </label>

                        <select
                            value={formData.categoryIds[0] || ""}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    categoryIds:
                                        event.target.value
                                            ? [event.target.value]
                                            : [],
                                }))
                            }
                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                        >

                            <option value="">
                                Select a category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Tags */}

                    <div>

                        <label className="mb-2 block font-semibold">
                            Tags
                        </label>

                        <input
                            type="text"
                            value={formData.tags.join(", ")}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    tags: event.target.value
                                        .split(",")
                                        .map((value) =>
                                            value.trim()
                                        )
                                        .filter(Boolean),
                                }))
                            }
                            placeholder="react, javascript, meetup"
                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                        />

                        <p className="mt-1 text-sm text-gray-500">
                            Separate tags with commas.
                        </p>

                    </div>

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
                                    visibility:
                                        event.target.value,
                                }))
                            }
                            className="w-full rounded-lg border border-brand-100 px-4 py-2"
                        >

                            <option value="PUBLIC">
                                Public
                            </option>

                            <option value="PRIVATE">
                                Private
                            </option>

                            <option value="UNLISTED">
                                Unlisted
                            </option>

                        </select>

                    </div>

                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </form>
            </div>
        </section>
    );
}

export default EditEventPage;