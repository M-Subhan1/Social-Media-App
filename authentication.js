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
      updateToken: uniqueString(),
      tokenTime: new Date(),
      followers: [],
      following: [],
    };

    // If errors exist, prompting for input again
    if (err.length > 0) {
      return res.render(200, "register", {
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
          Paste the following link in your browser to verify your account: localhost:5000/validate/${create_user.updateToken}`,
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
  res.redirect(301, "/login");
};

module.exports.validateUser = async (req, res) => {
  const user = await User.findOne({ updateToken: req.params.token });
  const time = new Date();

  if (user == null) return res.send("Invalid link");

  if (
    time.getHours() - user.tokenTime.getHours() > 1 ||
    time.getMinutes() - user.tokenTime.getMinutes() > 59
  )
    return res.send("Verification link has expired");

  await User.updateOne({ email: user.email }, { $set: { isVerified: true } });

  return res.redirect(301, "/login");
};

module.exports.setNewPassword = async (req, res) => {
  const user = User.findOne({ updateToken: req.params.token });
  res.send(user);
};

module.exports.reset = async (req, res) => {
  //
  const user = await User.findOne({ email: req.body.email });
  const token = uniqueString();

  if (user == null) return res.send("No such email");

  await User.updateOne({
    $set: { tokenTime: new Date(), updateToken: token },
  });

  // turn into a class
  const emailConfig = {
    from: `${process.env.EMAIL}`,
    to: `${user.email}`,
    subject: "Verify Email Address",
    text: `Hi ${user.firstName} ${user.lastName}, your (or someone else) has requested password reset for this account!!
          Paste the following link in your browser to reset your password: localhost:5000/validate/${token}`,
  };

  transporter.sendMail(emailConfig, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: " + info.message);
      console.log("Preview: " + nodemailer.getTestMessageUrl(info));
    }
  });

  res.send("Email sent!! check your email");
};
