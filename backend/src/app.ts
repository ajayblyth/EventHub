
import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js"

import errorHandler from "./middleware/errorHandler.js";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);


app.get( "/", (req, res)=> {

res.json({
    success:true,
    message: "eventhub is running",
})

})

app.use(errorHandler);

export default app;
