import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../store/store";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;




/*
ProtectedRoute
      │
      ↓
isLoading?
   ↓ yes
 Loading...

      ↓ no
isAuthenticated?
   ↙          ↘
 no           yes
 ↓             ↓
/login       Outlet
              ↓
          actual page
*/