const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieSession = require("cookie-session");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
require("./config/passport");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
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
const allowedOrigins = [
  "http://localhost:5173",
  "https://projexia-eight.vercel.app",
  "https://projexia.sanskarkoserwal.online",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST",
    credentials: true,
  })
);

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
