import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import eventRoutes from "./routes/event.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import venueRoutes from "./routes/venue.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import categoryRoutes from "./routes/category.routes.js";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "eventhub is running",
  });
});

// Error handler — keep this LAST
app.use(errorHandler);

export default app;