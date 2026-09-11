import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function PaymentPage() {
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

        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify payment on backend
            const response = await api.post(
              "/payments/verify",
              {
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                eventId,

                tickets: tickets.map((ticket: any) => ({
                  ticketTierId: ticket.ticketTierId,
                  quantity: ticket.quantity,
                })),
              }
            );

            console.log(
              "Payment verified successfully:",
              response.data
            );

            // Redirect to booking success page
            navigate("/booking-success", {
              state: {
                booking: response.data.booking,
                payment: response.data.payment,
              },
            });

          } catch (error: any) {
            console.error(
              "Payment verification failed:",
              error
            );

            alert(
              error.response?.data?.message ||
              "Payment was successful, but verification failed."
            );
          }
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
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-brand-900">
          Payment
        </h1>

        <h2 className="mt-6 text-xl font-semibold text-brand-900">
          {eventTitle}
        </h2>

        <div className="mt-6 rounded-xl bg-brand-50 p-6">
          <p className="text-sm text-brand-600">
            Amount to pay
          </p>

          <p className="mt-2 text-3xl font-bold text-brand-900">
            ₹{totalAmount}
          </p>
        </div>

        <p className="mt-6 text-brand-600">
          You will be redirected to Razorpay's secure
          checkout to complete your payment.
        </p>

        <button
          onClick={handlePayment}
          className="mt-8 w-full rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800"
        >
          Pay ₹{totalAmount}
        </button>

      </div>
    </section>
  );
}

export default PaymentPage;


/*
Razorpay payment successful
        ↓
POST /payments/verify
        ↓
Backend verifies signature
        ↓
Backend creates Booking
        ↓
Backend creates Payment
        ↓
Frontend receives:
   booking
   payment
        ↓
Success message
*/