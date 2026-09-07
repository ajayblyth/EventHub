import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");

  const [message, setMessage] = useState("");

  // Get values from the URL
  const token = searchParams.get("token");
  const eventId = searchParams.get("eventId");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await api.get(
          `/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus("error");

        setMessage(
          error.response?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [searchParams, token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        {status === "verifying" && (
          <>
            <h1 className="mb-3 text-2xl font-bold">
              Verifying your email...
            </h1>

            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="mb-3 text-2xl font-bold text-green-600">
              Email Verified!
            </h1>

            <p className="mb-6 text-gray-600">
              {message}
            </p>

            <button
              type="button"
              onClick={() => {
                if (eventId) {
                  navigate(`/events/${eventId}/edit`);
                } else {
                  navigate("/events");
                }
              }}
              className="rounded-lg bg-brand-300 px-5 py-2 font-semibold text-brand-900 hover:bg-brand-400"
            >
              {eventId ? "Return to Event" : "Go to Events"}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="mb-3 text-2xl font-bold text-red-600">
              Verification Failed
            </h1>

            <p className="mb-6 text-gray-600">
              {message}
            </p>

            <button
              type="button"
              onClick={() => navigate("/events")}
              className="rounded-lg bg-gray-200 px-5 py-2 font-semibold hover:bg-gray-300"
            >
              Back to Events
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;