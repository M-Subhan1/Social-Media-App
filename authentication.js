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

  if (user == null || !user.tokenIsValid) return res.redirect(301, "/login");

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
          Paste the following link in your browser to verify your account: localhost:5000/validate/${create_user.tokenString}`,
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
  const user = await User.findOne({ tokenString: req.params.token });
  const time = new Date();

  if (user == null) return res.send("Invalid link");
  if (!user.tokenIsValid) return res.send("Invalid Token");
  if (user.isVerified) return res.redirect("/login");

  await User.updateOne(
    { email: user.email },
    { $set: { isVerified: true, tokenIsValid: false } }
  );

  return res.redirect(301, "/login");
};

module.exports.setNewPassword = async (req, res) => {
  res.redirect(`/password/${req.params.token}`);
};

module.exports.updatePassword = async (req, res) => {
  if (req.body.password != req.body.password2)
    return res.send("Both passwords must match!!");

  const salt = await bcrypt.genSalt();
  const hashed_password = await bcrypt.hash(req.body.password, salt);

  await User.updateOne(
    { tokenString: req.params.token },
    { $set: { password: hashed_password, tokenIsValid: false } }
  );

  return res.send("Password updated!!");
};

module.exports.reset = async (req, res) => {
  //
  const user = await User.findOne({ email: req.body.email });
  const token = uniqueString();

  if (user == null) return res.send("No user exists for the email");
  if (!user.isVerified)
    return res.send("User has to be verified before you can reset password!!");

  await User.updateOne({
    $set: { tokenTime: new Date(), tokenString: token, tokenIsValid: true },
  });

  // turn into a class
  const emailConfig = {
    from: `${process.env.EMAIL}`,
    to: `${user.email}`,
    subject: "Verify Email Address",
    text: `Hi ${user.firstName} ${user.lastName}, your (or someone else) has requested password reset for this account!!
          Paste the following link in your browser to reset your password: localhost:5000/reset/${token}`,
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
