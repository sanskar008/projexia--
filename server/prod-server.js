const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("cookie-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./dist/routes/authRoutes.js");
// For CJS default export interop
const authRoutesDefault = authRoutes.default || authRoutes;

// Load environment variables
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

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

// Use compiled routes
app.use("/auth", authRoutesDefault);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
