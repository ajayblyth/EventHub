import { useLocation } from "react-router-dom";
import api from "../../api/axios";

function PaymentPage() {
  const location = useLocation();

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
      // 1. Create Razorpay order on backend
      const response = await api.post(
        "/payments/create-order",
  {
  eventId,
  tickets: tickets.map((ticket: any) => ({
    ticketTierId: ticket.ticketTierId,
    quantity: ticket.quantity,
  })),
}
      );

      const { orderId, amount, currency } = response.data;

      // 2. Configure Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "EventHub",
        description: `Ticket booking for ${eventTitle}`,
        order_id: orderId,

        handler: function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          console.log(
            "Razorpay payment successful:",
            paymentResponse
          );

          console.log("Event ID:", eventId);
          console.log("Tickets:", tickets);

          alert("Test payment successful!");
        },

        theme: {
          color: "#7c3aed",
        },
      };

      // 3. Open Razorpay Checkout
      const Razorpay = (window as any).Razorpay;

      const razorpay = new Razorpay(options);

      razorpay.open();
    } catch (error: any) {
      console.error(
        "Razorpay payment error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to start payment"
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
          <p className="text-sm text-brand-600">
            You will be redirected to Razorpay's secure
            checkout to complete your payment.
          </p>
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

export default PaymentPage;