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
app.use(express.json());

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"));

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS for frontend
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:5173",
      "https://projexia-eight.vercel.app",
      "https://projexia.sanskarkoserwal.online",
    ],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
