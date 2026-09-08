import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

function TicketDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string>("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const response = await api.get(`/bookings/${id}`);

                setBooking(response.data.booking);
                setQrCode(response.data.qrCode);

            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load ticket"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadBooking();
        }
    }, [id]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };



    //download pdf 
    const handleDownloadPdf = async () => {
        try {
            const response = await api.get(
                `/bookings/${id}/pdf`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: "application/pdf",
                })
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = `eventhub-ticket-${id}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Failed to download ticket"
            );
        }
    };



    if (isLoading) {
        return (
            <p className="p-8 text-center">
                Loading ticket...
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

    if (!booking) {
        return (
            <p className="p-8 text-center">
                Booking not found.
            </p>
        );
    }

    const event = booking.eventId;
    const venue = event?.venueId;

    return (
        <section className="min-h-screen bg-brand-50 px-6 py-12">
            <div className="mx-auto max-w-3xl">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/my-bookings")}
                    className="mb-6 text-sm font-semibold text-brand-700 hover:underline"
                >
                    ← Back to My Bookings
                </button>

                {/* Ticket */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                    {/* Header */}
                    <div className="border-b border-brand-100 p-6">
                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <p className="text-sm font-semibold text-brand-500">
                                    EventHub Ticket
                                </p>

                                <h1 className="mt-1 text-3xl font-bold text-brand-900">
                                    {event?.title || "Event"}
                                </h1>
                            </div>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {booking.status}
                            </span>

                        </div>
                    </div>

                    {/* Event Information */}
                    <div className="grid gap-5 border-b border-brand-100 p-6 sm:grid-cols-3">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                Date
                            </p>

                            <p className="mt-1 font-medium text-brand-900">
                                {event?.startAt
                                    ? formatDate(event.startAt)
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                Time
                            </p>

                            <p className="mt-1 font-medium text-brand-900">
                                {event?.startAt && event?.endAt
                                    ? `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`
                                    : "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                Venue
                            </p>

                            <p className="mt-1 font-medium text-brand-900">
                                {venue?.name || "—"}
                            </p>

                            {venue?.address && (
                                <p className="mt-1 text-sm text-brand-600">
                                    {venue.address}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Tickets */}
                    <div className="p-6">

                        <h2 className="text-lg font-semibold text-brand-900">
                            Tickets
                        </h2>

                        <div className="mt-4 space-y-4">

                            {booking.tickets.map((ticket: any) => (
                                <div
                                    key={ticket.ticketTierId}
                                    className="flex items-center justify-between border-b border-brand-100 pb-4"
                                >

                                    <div>
                                        <p className="font-medium text-brand-800">
                                            {ticket.name} × {ticket.quantity}
                                        </p>

                                        <p className="mt-1 text-sm text-brand-500">
                                            ₹{ticket.price} each
                                        </p>
                                    </div>

                                    <p className="font-semibold text-brand-800">
                                        ₹{ticket.subtotal}
                                    </p>

                                </div>
                            ))}

                        </div>

                        {/* Total */}
                        <div className="mt-5 flex justify-between">
                            <span className="font-semibold text-brand-900">
                                Total
                            </span>

                            <span className="text-xl font-bold text-brand-800">
                                ₹{booking.totalAmount}
                            </span>
                        </div>

                        {/* QR code */}

                        <div className="border-t border-brand-100 p-6 text-center">
                            <h2 className="text-lg font-semibold text-brand-900">
                                Your Ticket QR Code
                            </h2>

                            <p className="mt-1 text-sm text-brand-500">
                                Show this QR code at the event entrance.
                            </p>

                            {qrCode && (
                                <div className="mt-4 flex justify-center">
                                    <img
                                        src={qrCode}
                                        alt="Booking QR Code"
                                        className="h-48 w-48"
                                    />
                                </div>
                            )}
                        </div>

                        {/* download pdf */}
                        <div className="border-t border-brand-100 p-6 text-center">
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                className="rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900"
                            >
                                Download Ticket PDF
                            </button>
                        </div>

                    </div>

                    {/* Booking Information */}
                    <div className="border-t border-brand-100 bg-brand-50 p-6">

                        <div className="grid gap-4 sm:grid-cols-2">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                    Booking ID
                                </p>

                                <p className="mt-1 text-sm font-medium text-brand-800">
                                    #{booking._id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                    Booked On
                                </p>

                                <p className="mt-1 text-sm font-medium text-brand-800">
                                    {booking.createdAt
                                        ? formatDate(booking.createdAt)
                                        : "—"}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}

export default TicketDetailsPage;