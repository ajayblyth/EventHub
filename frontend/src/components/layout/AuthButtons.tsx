import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { clearCredentials } from "../../store/slices/authSlice";
import { logoutUser } from "../../api/auth.api";

function AuthButtons() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();

      dispatch(clearCredentials());
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        {/* User Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg
                     px-4 py-2 font-semibold text-brand-900
                     transition-colors hover:bg-brand-50"
        >
{user.firstName}
          <span className="text-sm">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute right-0 z-20 mt-2 w-48 rounded-lg
                       border border-brand-100 bg-white py-2 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/events/my-events");
              }}
              className="w-full px-4 py-2 text-left font-medium
                         text-brand-900 hover:bg-brand-50"
            >
              Manage My Events
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left font-medium
                         text-brand-800 hover:bg-brand-50"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="whitespace-nowrap rounded-lg px-4 py-2
                   font-semibold text-brand-800
                   transition-colors hover:bg-brand-50"
      >
        Log In
      </Link>

      <Link
        to="/register"
        className="whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2
                   font-semibold text-white
                   transition-colors hover:bg-brand-600"
      >
        Sign Up
      </Link>
    </div>
  );
}

export default AuthButtons;