const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const authentication = require("./authentication");
const userRouter = require("./routes/users");

authentication.configure(passport);

// Creating an app object (instance of express class)
const app = express();

// Passport middleware
app.use(flash());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middlewares
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ entended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressLayouts);
app.set("view engine", "ejs");

app
  .route("/")
  .all(authentication.isLoggedIn)
  .get((req, res) => res.render("index", { name: req.user.firstName }));

// login route
app
  .route("/login")
  .all(authentication.isLoggedOut)
  .get((req, res) => res.render("login"))
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

// Reigster route
app
  .route("/register")
  .all(authentication.isLoggedOut)
  .get((req, res) => res.render("register"))
  .post(authentication.signup);

app.post("/logout", authentication.isLoggedIn, authentication.logOut);
app.get("/reset", (req, res) => res.render("reset"));
app.post("/reset", authentication.reset);
// Users route
app.use("/users", authentication.isLoggedIn, userRouter);
app.get(
  "/validate/:token",
  authentication.isLoggedOut,
  authentication.validateUser
);
//
app.get(
  "/reset/:token",
  authentication.isValidToken,
  authentication.isLoggedOut,
  authentication.setNewPassword
);
//
app
  .route("/password/:token")
  .all(authentication.isValidToken, authentication.isLoggedOut)
  .get((req, res) => {
    res.render("setPassword", { url: `${req.params.token}` });
  })
  .post(authentication.updatePassword);

// posts route
app.use("*", (req, res) => res.redirect("/"));
// Exporting the app
module.exports = app;
