const bcrypt = require("bcryptjs");
const uniqueString = require("unique-string");
const nodemailer = require("nodemailer");

const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/userModels");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.isValidToken = async (req, res, next) => {
  const user = await User.findOne({ tokenString: req.params.token });

  if (user == null || !user.tokenIsValid) {
    req.flash("info", "The link has expired!!");
    return res.redirect(301, "/login");
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect(301, "/login");
};

module.exports.isLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect(301, "/", { name: req.user.firstName });
};

module.exports.signup = async (req, res) => {
  try {
    let err = [];

    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.password ||
      !req.body.password2 ||
      !req.body.email
    )
      err.push({ message: "Fill in all the fields" });

    if (req.body.password.length < 6)
      err.push({ message: "Password must be greater than 6 characters" });

    if (req.body.password != req.body.password2)
      err.push({ message: "Passwords do not match!" });

    const user = await User.findOne({
      email: req.body.email,
    });

    if (user != null)
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
    };

    // If errors exist, prompting for input again // Fix thiss
    if (err.length > 0) {
      return res.render("register", {
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

    // Turn into a class
    const emailConfig = {
      from: `${process.env.EMAIL}`,
      to: `${create_user.email}`,
      subject: "Verify Email Address",
      text: `Hi ${create_user.firstName} ${create_user.lastName}, welcome to the community from the developers!!
          Paste the following link in your browser to verify your account: ${process.env.DOMAIN}validate/${create_user.tokenString}`,
    };

    transporter.sendMail(emailConfig, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + info.message);
        console.log("Preview: " + nodemailer.getTestMessageUrl(info));
      }
    });

    // Add redirect to login page
    req.flash("message", "Account created!! Verify your email to login");
    res.redirect(301, "/login");
  } catch (err) {
    res.status(500).json({
      data: err,
    });
  }
};

module.exports.configure = passport => {
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

module.exports.logOut = (req, res) => {
  req.logOut();
  req.flash("message", "Successfully Logged out!");
  res.redirect(301, "/login");
};

module.exports.validateUser = async (req, res) => {
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
  return res.redirect(301, "/login");
};

module.exports.setNewPassword = async (req, res) => {
  res.render("setPassword", {
    url: `/password/${req.params.token}`,
    warning: req.flash("warning"),
  });
};

module.exports.updatePassword = async (req, res) => {
  if (req.body.password != req.body.password2) {
    req.flash("warning", "Both passwords must match!!");
    return res.redirect(`/reset/${req.params.token}`);
  }

  const salt = await bcrypt.genSalt();
  const hashed_password = await bcrypt.hash(req.body.password, salt);

  await User.updateOne(
    { tokenString: req.params.token },
    { $set: { password: hashed_password, tokenIsValid: false } }
  );

  req.flash("message", "Password updated!!");
  return res.redirect("/login");
};

module.exports.reset = async (req, res) => {
  let err = [];

  const user = await User.findOne({ email: req.body.email });
  const token = uniqueString();

  if (user == null) {
    err.push({ message: "No user exists for the email" });
    return res.render("reset", { err });
  }

  if (!user.isVerified) {
    err.push({
      message: "User has to be verified before you can reset password!!",
    });

    return res.render("reset", { err });
  }

  await User.updateOne({
    $set: { tokenTime: new Date(), tokenString: token, tokenIsValid: true },
  });

  // turn into a class
  const emailConfig = {
    from: `${process.env.EMAIL}`,
    to: `${user.email}`,
    subject: "Reset Password",
    text: `Hi ${user.firstName} ${user.lastName}, your (or someone else) has requested password reset for this account!!
          Paste the following link in your browser to reset your password: ${process.env.DOMAIN}reset/${token}`,
  };

  transporter.sendMail(emailConfig, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + info.message);
      console.log("Preview: " + nodemailer.getTestMessageUrl(info));
    }
  });

  req.flash("message", "Check your email for password reset instructions");
  res.redirect("/login");
};
