const express = require("express");

const authentication = require("../controllers/authController");
const dashboard = require("../dashboard");
const passport = require("passport");

const router = express.Router();

// Profile route
router
  .route("/profile")
  // .all(authentication.isLoggedIn)
  .get(dashboard.profile)
  .post(dashboard.updateProfile);

router.route("/timeline").get(authentication.isLoggedIn, dashboard.mine);

router
  .route("/login")
  .all(authentication.isLoggedOut)
  .get((req, res) =>
    res.render("login", {
      title: "Login",
      message: req.flash("message"),
      info: req.flash("info"),
    })
  )
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

// Reigster route and password resets
router
  .route("/register")
  .all(authentication.isLoggedOut)
  .get((req, res) => res.render("register", { title: "Register" }))
  .post(authentication.signup);

router.get("/reset", (req, res) => res.render("reset", { title: "Reset" }));
router.post("/reset", authentication.reset);
// Users route
router.get(
  "/validate/:token",
  authentication.isLoggedOut,
  authentication.validateUser
);
//
router.get(
  "/reset/:token",
  authentication.isValidToken,
  authentication.isLoggedOut,
  authentication.setNewPassword
);
//
router.post(
  "/password/:token",
  authentication.isValidToken,
  authentication.isLoggedOut,
  authentication.updatePassword
);

router.route("/").all(authentication.isLoggedIn).get(dashboard.populate);

module.exports = router;
