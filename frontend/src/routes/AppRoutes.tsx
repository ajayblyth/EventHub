import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
// import Home from "../pages/Home";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import Profile from "../pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import EventsPage from "../pages/events/EventsPage";
import CreateEventPage from "../pages/events/CreateEventPage";
import EventDetailsPage from "../pages/events/EventDetailsPage";
import MyEventsPage from "../pages/events/MyEventsPage";
import EditEventPage from "../pages/events/EditEventPage";


function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<EventsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />

        {/* Public */}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/my-events" element={<MyEventsPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />}
          />


        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;