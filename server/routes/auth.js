// const router = require("express").Router();
// const passport = require("passport");

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("http://localhost:8080"); // your frontend URL
//   }
// );

// router.get("/logout", (req, res) => {
//   req.logout(() => {
//     res.send("Logged out");
//   });
// });

// router.get("/current-user", (req, res) => {
//   res.send(req.user || null);
// });

// module.exports = router;

//Bypass

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";
// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      email
    )}`;
    const user = new User({ name, email, password: hashedPassword, avatarUrl });
    await user.save();
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update user avatar
router.put("/me/avatar", async (req, res) => {
  try {
    const { userId, avatarUrl } = req.body;
    if (!userId || !avatarUrl) {
      return res
        .status(400)
        .json({ message: "userId and avatarUrl are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.avatarUrl = avatarUrl;
    await user.save();
    res.json({ message: "Avatar updated", avatarUrl });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Google Auth Route
router.get(
  "/google",
  (req, res, next) => {
    if (BYPASS_AUTH) {
      // Directly redirect to callback bypassing Google
      return res.redirect("/auth/google/callback?bypass=true");
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    if (req.query.bypass && BYPASS_AUTH) {
      // Create mock user session
      req.login(
        {
          displayName: "Test User",
          emails: [{ value: "test@example.com" }],
          id: "1234567890",
        },
        (err) => {
          if (err) return next(err);
          return res.redirect("http://localhost:8080");
        }
      );
    } else {
      next();
    }
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:8080"); // your frontend URL
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

// Get Current User
router.get("/current-user", (req, res) => {
  if (BYPASS_AUTH && !req.user) {
    return res.send({
      displayName: "Test User",
      emails: [{ value: "test@example.com" }],
      id: "1234567890",
    });
  }
  res.send(req.user || null);
});

module.exports = router;
