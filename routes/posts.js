const express = require("express");

const postController = require("../controllers/postController");

const router = express.Router();

router.route("/").post(postController.post);
router.route("/comment/:post").post(postController.comment);
router.route("/getAll").get(postController.getAll);

module.exports = router;
