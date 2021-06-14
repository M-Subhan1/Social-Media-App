// Required modules
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
// Database
const Post = require("../models/postModel");
const User = require("../models/userModels");
// Classes
const NewPost = require("../Classes/Posts");
const Comment = require("../Classes/Comments");

// Multer Configuration
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
// Filters the file type
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

module.exports.upload = upload.single("image");

// Add post
module.exports.post = async (req, res) => {
  try {
    // if the post content is not empty, creating a new post
    if (req.body.content.trim() != "") {
      // creating post object
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
    // Redirecting to Dashboard
    res.redirect("/");
    //
  } catch {
    res.status(404).send("Error: 404");
  }
};

// Add comment
module.exports.comment = async (req, res, next) => {
  //
  try {
    // If comment content is empty, redirecting to dashboard
    const content = req.body.text.trim();
    if (content == "") return res.redirect("/");

    // Creating Comment Object
    const new_comment = new Comment(
      req.user.firstName,
      req.user.lastName,
      req.user._id,
      content
    );
    // Adding comment to the post object
    await Post.findOneAndUpdate(
      { _id: req.params.post },
      { $push: { comments: new_comment } }
    );
    // Rediirecting to dashboard
    res.redirect("/");
  } catch {
    res.status(404).send("Error: 404");
  }
};

// Delete post
module.exports.deletePost = async (req, res) => {
  try {
    // Finding the post from the users' posts
    let post;
    if (req.user.posts.includes(req.params.post)) {
      // Deleting the post
      post = await Post.findOneAndDelete({ _id: req.params.post });
      // Updating users' post property
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { posts: req.params.post } }
      );
    }

    // Deleting the post image
    if (post.image != "")
      fs.unlink(`${__dirname}/../public/img/posts/${post.image}`, err => {
        if (err) console.log(err);
      });
    // Redirecting to dashboard
    return res.redirect("/");
    //
  } catch {
    res.status(404).send("Error: 404");
  }
};

// Delete comment
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
