const express = require("express");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const authentication = require("./controllers/authController");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
// Configuring Passport
authentication.configure(passport);
// Creating an app object (instance of express class)
const app = express();

// Setting Up Passport
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 108000000 },
  })
);

app.use(passport.initialize());
app.use(cookieParser("secret abc"));
app.use(passport.session());
app.use(flash());
// Middlewares
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
// Parsing Request data
app.use(express.json());
app.use(express.urlencoded({ entended: true }));
// Setting and confuguring view engine
app.set("layout", "./layouts/layout");
app.use(expressLayouts);
app.set("view engine", "ejs");
// Setting static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
// Logout route
app.post("/logout", authentication.isLoggedIn, authentication.logOut);
// Users Router
app.use("/users", authentication.isLoggedIn, userRouter);
// Posts Route
app.use("/posts", authentication.isLoggedIn, postRouter);
// Authentication Routes
app.use("/", authRouter);

app.get("^[^.]+$|.(?!(css|js)$)([^.]+$)", (req, res) => res.redirect("/"));
// Exporting the app
module.exports = app;
