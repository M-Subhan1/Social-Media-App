const express = require("express");

const postController = require("../controllers/postController");

const router = express.Router();

router.route("/").post(postController.upload, postController.post);
router.route("/delete/:post").get(postController.deletePost);
router.route("/comment/:post").post(postController.comment);
router.route("/comments/delete/:comment").get(postController.deleteComment);

module.exports = router;
