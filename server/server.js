const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieSession = require("cookie-session");

// Register ts-node for TypeScript support in development
require("ts-node").register();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projectRoutes.ts").default;
require("./config/passport");

const app = express();
console.log("Registering middleware: express.json()");
app.use(express.json());

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"));

console.log("Registering middleware: CORS");
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

console.log("Registering middleware: passport.initialize()");
app.use(passport.initialize());
console.log("Registering middleware: passport.session()");
app.use(passport.session());

// CORS for frontend
const cors = require("cors");

console.log("Registering middleware: static files");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://projexia-eight.vercel.app",
  "https://projexia.sanskarkoserwal.online",
];
console.log("CORS allowedOrigins:", allowedOrigins);
if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
  console.warn(
    "allowedOrigins is empty or invalid, allowing all origins for debugging."
  );
  allowedOrigins = undefined;
}
console.log("Registering middleware: static files");
// CORS middleware (debug: allow all origins)
app.use(cors());

console.log("Registering route: /api/auth");
app.use("/api/auth", authRoutes);
console.log("Registering route: /api/projects");
app.use("/api/projects", projectRoutes);

console.log("Registering route: GET /");
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
