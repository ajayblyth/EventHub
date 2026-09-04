import { useLocation, useNavigate } from "react-router-dom";

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    eventId,
    eventTitle,
    tickets,
  } = location.state || {};

  if (!tickets || tickets.length === 0) {
    return (
      <section className="min-h-screen bg-brand-50 px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-brand-900">
            No tickets selected
          </h1>

          <p className="mt-3 text-brand-600">
            Please go back and select at least one ticket.
          </p>
        </div>
      </section>
    );
  }

  const totalAmount = tickets.reduce(
    (total: number, ticket: any) =>
      total + ticket.price * ticket.quantity,
    0
  );

  const handleProceedToPayment = () => {
    navigate("/payment", {
      state: {
        eventId,
        eventTitle,
        tickets,
        totalAmount,
      },
    });
  };

  return (
    <section className="min-h-screen bg-brand-50 px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-brand-900">
          Checkout
        </h1>

        <h2 className="mt-2 text-xl font-semibold text-brand-800">
          {eventTitle}
        </h2>

        <div className="mt-8 space-y-4">
          {tickets.map((ticket: any) => (
            <div
              key={ticket.ticketTierId}
              className="flex items-center justify-between rounded-lg border border-brand-100 p-4"
            >
              <div>
                <h3 className="font-semibold text-brand-900">
                  {ticket.name}
                </h3>

                <p className="mt-1 text-sm text-brand-600">
                  ₹{ticket.price} × {ticket.quantity}
                </p>
              </div>

              <p className="font-semibold text-brand-800">
                ₹{ticket.price * ticket.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-brand-100 pt-6">
          <span className="text-lg font-semibold text-brand-900">
            Total
          </span>

          <span className="text-2xl font-bold text-brand-800">
            ₹{totalAmount}
          </span>
        </div>

        <button
          type="button"
          onClick={handleProceedToPayment}
          className="mt-6 w-full rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white transition hover:bg-brand-800"
        >
          Proceed to Payment
        </button>

      </div>
    </section>
  );
}

export default CheckoutPage;