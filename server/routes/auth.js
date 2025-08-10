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

const router = require("express").Router();
const passport = require("passport");

const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

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
