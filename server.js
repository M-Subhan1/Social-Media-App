const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app.js");

const DataBase = process.env.DB_LINK.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
