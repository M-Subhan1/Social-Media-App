const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app.js");

// Retrieving database URI from environment variables
const DataBase = process.env.DB_LINK.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

// Connecting to MongoDB using Mongoose
try {
  mongoose
    .connect(DataBase, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connection successful"));
} catch (err) {
  console.log("Cannot connect to the Database");
}

// Starting the server on port provided
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
