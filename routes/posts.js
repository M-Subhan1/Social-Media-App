const express = require("express");

const postsController = require("../controllers/postController");

const router = express.Router();

router.route("/").post(postsController.post);

module.exports = router;
