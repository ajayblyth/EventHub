import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { booking, payment } = location.state || {};

    if (!booking) {
        return (
            <section className="min-h-screen bg-brand-50 px-6 py-12">
                <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center shadow-sm">

                    <h1 className="text-2xl font-bold text-brand-900">
                        Booking information not found
                    </h1>

                    <p className="mt-3 text-brand-600">
                        Please go back and complete your booking again.
                    </p>

                    <button
                        onClick={() => navigate("/events")}
                        className="mt-6 rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white"
                    >
                        Browse Events
                    </button>

                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-brand-50 px-6 py-12">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">

                <div className="text-center">

                    <div className="text-5xl">
                        ✓
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-brand-900">
                        Booking Confirmed!
                    </h1>

                    <p className="mt-3 text-brand-600">
                        Your payment was successful and your booking has been confirmed.
                    </p>

                </div>

                <div className="mt-8 rounded-xl bg-brand-50 p-6">

                    <h2 className="text-xl font-semibold text-brand-900">
                        Booking Details
                    </h2>

                    <div className="mt-5 space-y-4">

                        <div>
                            <p className="text-sm text-brand-600">
                                Booking ID
                            </p>

                            <p className="mt-1 break-all font-medium text-brand-900">
                                {booking._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-brand-600">
                                Amount Paid
                            </p>

                            <p className="mt-1 text-xl font-bold text-brand-900">
                                ₹{booking.totalAmount}
                            </p>
                        </div>

                        {payment?.razorpayPaymentId && (
                            <div>
                                <p className="text-sm text-brand-600">
                                    Razorpay Payment ID
                                </p>

                                <p className="mt-1 break-all font-medium text-brand-900">
                                    {payment.razorpayPaymentId}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-brand-600">
                                Booking Status
                            </p>

                            <p className="mt-1 font-semibold text-brand-700">
                                CONFIRMED
                            </p>
                        </div>

                    </div>

                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="flex-1 rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800"
                    >
                        View My Bookings
                    </button>

                    <button
                        onClick={() => navigate("/events")}
                        className="flex-1 rounded-xl border border-brand-300 px-6 py-3 font-semibold text-brand-900 transition hover:bg-brand-50 hover:border-brand-500 hover:text-brand-700"
                    >
                        Browse More Events
                    </button>

                </div>

            </div>
        </section>
    );
}

export default BookingSuccessPage;