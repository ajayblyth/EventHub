import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify() {
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-email-otp",
        { otp }
      );

      setSuccess(
        response.data.message ||
          "Email verified successfully."
      );

     setTimeout(() => {
  navigate("/events/my-events");
}, 1000);


    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold">
          Verify Your Email
        </h1>

        <p className="mb-6 text-center text-gray-600">
          We sent a 6-digit verification OTP to your email.
          Enter it below to continue.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setOtp(value);
          }}
          placeholder="Enter 6-digit OTP"
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-emerald-600"
        />

        {error && (
          <p className="mb-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-4 text-center text-sm text-green-600">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          OTP expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}


/*
/verify-email?eventId=123
          ↓
User enters 6-digit OTP
          ↓
POST /api/auth/verify-email-otp
          ↓
Backend checks:
  userId
  OTP
  expiry
          ↓
isVerified = true
          ↓
Return success
          ↓
/events/123/edit
*/