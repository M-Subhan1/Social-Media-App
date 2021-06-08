const multer = require("multer");
const crypto = require("crypto");

const Post = require("../models/postModel");
const User = require("../models/userModels");

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
      const new_post = {
        author: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          id: req.user._id,
        },

        content: req.body.content,
        time: new Date(),
      };

      if (req.file) new_post.image = req.file.filename;

      const post = await Post.create(new_post);
      const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { posts: post._id } }
      );
    }
    res.redirect("/");
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.comment = async (req, res, next) => {
  //
  try {
    const text = req.body.text.trim();
    if (text == "") return res.redirect("/");

    // Turn into class
    const new_comment = {
      author: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
      text,
    };

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
    const posts = await Post.find({ "author.id": req.user.id });
    const filteredPost = posts.find(post => {
      comment = post.comments.find(
        comment => comment._id.valueOf() == req.params.comment
      );
      if (comment) return true;
    });

    console.log(comment);

    await Post.findOneAndUpdate(
      { _id: filteredPost._id },
      {
        $pull: {
          comments: comment,
        },
      }
    );

    res.redirect("/");
  } catch {
    res.status(404).send("Error: 404");
  }
};
