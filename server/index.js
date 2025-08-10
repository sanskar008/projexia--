import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "cookie-session";
import passport from "passport";
import cors from "cors";
import "./config.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:5173",
  "https://projexia-eight.vercel.app",
];

// CORS middleware at the very top
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Explicitly handle preflight requests for all routes
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/auth/login", (req, res) => {
  res.send("Login endpoint is working (GET). Use POST for login.");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));
