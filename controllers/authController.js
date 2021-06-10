const bcrypt = require("bcryptjs");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/userModels");

const Email = require("../Classes/Email");
// Configuring transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Checks if the token string is valid
module.exports.isValidToken = async (req, res, next) => {
  try {
    const user = await User.findOne({ tokenString: req.params.token });

    if (user == null || !user.tokenIsValid) {
      req.flash("info", "The link has expired!!");
      return res.redirect(301, "/login");
    }
    next();
  } catch {
    res.status(404).send("Error: 404");
  }
};
// Checks if the user is logged out, else redirects to login
module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect(301, "/login");
};
// Checks if the user is logged out, else redirects to /
module.exports.isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect(301, "/", { name: req.user.firstName });
};
// Validates data Signups the user
module.exports.signup = async (req, res) => {
  try {
    let err = [];

    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.password ||
      !req.body.password2 ||
      !req.body.email ||
      !req.body.gender
    )
      err.push({ message: "Kindly fill in all the fields" });

    if (req.body.password.length < 6)
      err.push({ message: "Password must be greater than 6 characters" });

    if (req.body.password != req.body.password2)
      err.push({ message: "Passwords do not match!" });

    const user = await User.findOne({
      email: req.body.email,
    });

    if (user != null && user.isVerified == true)
      err.push({ message: "Email registered with another user!" });

    const salt = await bcrypt.genSalt();
    const hashed_password = await bcrypt.hash(req.body.password, salt);

    // Turn into a class
    const create_user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashed_password,
      email: req.body.email,
      isVerified: false,
      tokenString: uniqueString(),
      tokenTime: new Date(),
      tokenIsValid: true,
      following: [],
      followers: [],
      posts: [],
      gender: req.body.gender,
      dateJoined: new Date(),
    };

    // If errors exist, prompting for input again // Fix thiss
    if (err.length > 0) {
      return res.render("register", {
        title: "Register",
        err,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
      });
    }

    // Creating the user if there are no errors
    const new_user = await User.create(create_user);
    const domain = process.env.DOMAIN || "localhost:5000/";

    // Turn into a class
    const email = new Email(
      `${process.env.EMAIL}`,
      `${create_user.email}`,
      "Verify Email Address",
      `Hi ${create_user.firstName} ${create_user.lastName}, welcome to the community from the developers!!
          Paste the following link in your browser to verify your account: ${domain}validate/${create_user.tokenString}`
    );

    transporter.sendMail(email);

    // Add redirect to login page
    req.flash("message", "Account created!! Verify your email to login");
    res.redirect(301, "/login");
  } catch (err) {
    res.status(404).send("Error: 404");
  }
};
// Logs the user out
module.exports.logOut = (req, res) => {
  req.logout();
  req.flash("message", "Successfully Logged Out!!");
  return res.redirect("/login");
};
// Validates login
module.exports.validateUser = async (req, res) => {
  try {
    const user = await User.findOne({ tokenString: req.params.token });
    const time = new Date();

    if (user == null || !user.tokenIsValid || user.isVerified) {
      req.flash("info", "Invalid link");
      return res.redirect("/login");
    }

    await User.updateOne(
      { email: user.email },
      { $set: { isVerified: true, tokenIsValid: false } }
    );

    req.flash("message", "Account Verified!! You can now login");
    return res.redirect("/login");
  } catch {}
};
// Renders the Password Prompt webpage
module.exports.setNewPassword = async (req, res) => {
  try {
    res.render("setPassword", {
      title: "Password Reset",
      url: `/password/${req.params.token}`,
      warning: req.flash("warning"),
    });
  } catch {
    res.status(404).send("Error: 404");
  }
};
// Validates and stores password update
module.exports.updatePassword = async (req, res) => {
  try {
    if (req.body.password != req.body.password2) {
      req.flash("warning", "Both passwords must match!!");
      return res.redirect(`/reset/${req.params.token}`);
    }

    if (req.body.password.length < 6) {
      req.flash("warning", "Password must be greater than 6 characters");
      return res.redirect(`/reset/${req.params.token}`);
    }

    const salt = await bcrypt.genSalt();
    const hashed_password = await bcrypt.hash(req.body.password, salt);
    await User.updateOne(
      { tokenString: req.params.token.trim() },
      { $set: { password: hashed_password, tokenIsValid: true } }
    );

    req.flash("message", "Password updated!!");
    return res.redirect("/login");
  } catch {
    res.status(404).send("Error: 404");
  }
};
// Sends Password Reset Emails
module.exports.reset = async (req, res) => {
  try {
    let err = [];

    const user = await User.findOne(new Object({ email: req.body.email }));

    // Checking if user exists (if not add error to the err array and render on the reset menu)
    if (user == null) {
      err.push({ message: "No user exists for the email" });
      return res.render("reset", new Object({ title: "Password Reset", err }));
    }

    // Checking if the user is verified
    if (!user.isVerified) {
      err.push(
        new Object({
          message: "User has to be verified before you can reset password!!",
        })
      );

      return res.render("reset", new Object({ title: "Password Reset", err }));
    }

    // Generating and setting new tokenString and validity to true
    const token = uniqueString();
    await User.updateOne(
      new Object({ email: req.body.email }),
      new Object({
        $set: { tokenTime: new Date(), tokenString: token, tokenIsValid: true },
      })
    );

    // Setting up email object
    const domain = process.env.DOMAIN || "localhost:5000/";
    const email = new Email(
      `${process.env.EMAIL}`,
      `${user.email}`,
      "Reset Password",
      `Hi ${user.firstName} ${user.lastName}, your (or someone else) has requested password reset for this account!!
      Paste the following link in your browser to reset your password: ${domain}reset/${token}`
    );

    // Sending email and redirecting to login
    transporter.sendMail(email);
    req.flash("message", "Check your email for password reset instructions");
    res.redirect("/login");
    //
  } catch {
    res.status(404).send("Error: 404");
  }
};
// Password Configuration
module.exports.configure = passport => {
  // Middleware to help verify
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });

      if (user == null)
        return done(null, false, {
          message: "Email not registered for a user",
        });

      if (!user.isVerified)
        return done(null, false, {
          message: "Kindly verify your email address",
        });

      if (await bcrypt.compare(password, user.password))
        return done(null, user, { message: "Logged in!!" });

      return done(null, false, { message: "Password incorrect!!" });
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.email));
  passport.deserializeUser(async (id, done) => {
    user = await User.findOne({ email: id });
    return done(null, user);
  });
};
