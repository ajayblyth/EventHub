import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function FakePaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    eventId,
    eventTitle,
    tickets,
    totalAmount,
  } = location.state || {};

  if (!tickets || tickets.length === 0) {
    return (
      <section className="min-h-screen bg-brand-50 px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-brand-900">
            Invalid payment
          </h1>

          <p className="mt-3 text-brand-600">
            Please select tickets again.
          </p>
        </div>
      </section>
    );
  }

  const handlePayment = async () => {
    try {
      const response = await api.post("/bookings", {
        eventId,
        tickets: tickets.map((ticket: any) => ({
          ticketTierId: ticket.ticketTierId,
          quantity: ticket.quantity,
        })),
      });

      console.log("Payment successful:", response.data);

      navigate("/my-bookings");
    } catch (error: any) {
      console.error("Payment failed:", error);

      alert(
        error.response?.data?.message ||
          "Payment failed"
      );
    }
  };

  return (
    <section className="min-h-screen bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-brand-900">
          Payment
        </h1>

        <h2 className="mt-2 text-xl font-semibold text-brand-800">
          {eventTitle}
        </h2>

        <div className="mt-8 rounded-lg bg-brand-50 p-4">
          <p className="text-sm text-brand-600">
            Amount to pay
          </p>

          <p className="mt-1 text-2xl font-bold text-brand-900">
            ₹{totalAmount}
          </p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-900">
            Card Number
          </label>

          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-900">
              Expiry
            </label>

            <input
              type="text"
              placeholder="12/30"
              className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900">
              CVV
            </label>

            <input
              type="text"
              placeholder="123"
              className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          className="mt-8 w-full rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800"
        >
          Pay ₹{totalAmount}
        </button>

      </div>
    </section>
  );
}

export default FakePaymentPage;