const multer = require("multer");
const crypto = require("crypto");

const Post = require("../models/postModel");
const User = require("../models/userModels");
// Classes
const NewPost = require("../Classes/Posts");
const Comment = require("../Classes/Comments");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/posts");
  },

  filename: (req, file, cb) => {
    // Naming files
    const extenstion = file.mimetype.split("/")[1];
    const name = `post-${crypto
      .randomBytes(16)
      .toString("hex")}-${Date.now()}.${extenstion}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

module.exports.upload = upload.single("image");

module.exports.post = async (req, res) => {
  try {
    if (req.body.content.trim() != "") {
      // Turn into class
      const new_post = new NewPost(
        req.user.firstName,
        req.user.lastName,
        req.user._id,
        req.body.content
      );

      // If Image exists, adding an image property
      if (req.file) new_post.image = req.file.filename;
      // Saving post to the Database and updating user.posts array
      const post = await Post.create(new_post);
      const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { posts: post._id } }
      );
    }
    // REdirecting to Dashboard
    res.redirect("/");
    //
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.comment = async (req, res, next) => {
  //
  try {
    const content = req.body.text.trim();
    if (content == "") return res.redirect("/");

    // Creating Comment Object
    const new_comment = new Comment(
      req.user.firstName,
      req.user.lastName,
      req.user._id,
      content
    );

    console.log(new_comment);

    await Post.findOneAndUpdate(
      { _id: req.params.post },
      { $push: { comments: new_comment } }
    );

    res.redirect("/");
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    if (req.user.posts.includes(req.params.post)) {
      await Post.findOneAndDelete({ _id: req.params.post });
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { posts: req.params.post } }
      );
    }

    return res.redirect("/");
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.deleteComment = async (req, res) => {
  try {
    let comment;
    // Finding all the posts for the current user
    const posts = await Post.find({ "author.id": req.user.id });
    // Finding the post with the required comment
    const filteredPost = posts.find(post => {
      comment = post.comments.find(
        comment => comment._id.valueOf() == req.params.comment
      );
      if (comment) return true;
    });

    // Updating the Database (removing comment)
    await Post.findByIdAndUpdate(filteredPost._id, {
      $pull: {
        comments: comment,
      },
    });
    // Redirecting to dashboard
    res.redirect("/");
    //
  } catch {
    res.status(404).send("Error: 404");
  }
};
