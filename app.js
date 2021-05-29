const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const authentication = require("./authentication");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");

authentication.configure(passport);

// Creating an app object (instance of express class)
const app = express();

// Passport middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

app.use(passport.initialize());
app.use(cookieParser("secret abc"));
app.use(passport.session());
app.use(flash());
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
  .get((req, res) => res.render("dashboard", { name: req.user.firstName }));

// Users Roue
app.use("/users", authentication.isLoggedIn, userRouter);
// Posts Route
app.use("/posts", authentication.isLoggedIn, postsRouter);
// login route
app
  .route("/login")
  .all(authentication.isLoggedOut)
  .get((req, res) =>
    res.render("login", {
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
app
  .route("/register")
  .all(authentication.isLoggedOut)
  .get((req, res) => res.render("register"))
  .post(authentication.signup);

app.post("/logout", authentication.isLoggedIn, authentication.logOut);
app.get("/reset", (req, res) => res.render("reset"));
app.post("/reset", authentication.reset);
// Users route
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
app.post(
  "/password/:token",
  authentication.isValidToken,
  authentication.isLoggedOut,
  authentication.updatePassword
);

// posts route
app.use("*", (req, res) => res.redirect("/"));
// Exporting the app
module.exports = app;
