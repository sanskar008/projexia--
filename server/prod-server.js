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

let allowedOrigins = [
  "http://localhost:5173",
  "https://projexia-eight.vercel.app",
];
console.log("CORS allowedOrigins:", allowedOrigins);
if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
  console.warn(
    "allowedOrigins is empty or invalid, allowing all origins for debugging."
  );
  allowedOrigins = undefined;
}

// CORS middleware at the very top (debug: allow all origins)
console.log("Registering middleware: CORS");
app.use(cors());

// Explicitly handle preflight requests for all routes (debug: allow all origins)
app.options("*", cors());

console.log("Registering middleware: helmet");
app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

console.log("Registering middleware: express.json()");
app.use(express.json());
console.log("Registering middleware: passport.initialize()");
app.use(passport.initialize());
console.log("Registering middleware: passport.session()");
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

// Use compiled routes
console.log("Registering route: /auth");
app.use("/auth", authRoutesDefault);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
