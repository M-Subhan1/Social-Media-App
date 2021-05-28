const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// router.get("/register", userController.register);
router.get("/find/:email", userController.findUser);
router.get("/follow/:email", userController.follow);
router.get("/unfollow/:email", userController.unfollow);

module.exports = router;

// find user
// update user
