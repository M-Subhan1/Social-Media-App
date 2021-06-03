const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// router.get("/register", userController.register);
router.post("/find", userController.findUsers);
router.post("/follow/:id", userController.follow);
router.post("/unfollow/:id", userController.unfollow);
router.get("/profile/:id", userController.profile);

router.get("/follow/:id", userController.follow);
router.get("/unfollow/:id", userController.unfollow);
module.exports = router;

// find user
// update user
