const Post = require("../models/postModel");
const User = require("../models/userModels");

module.exports.post = async (req, res) => {
  // Error
  if (!req.user || !req.body.content) {
    console.log("Server error");
  }

  const new_post = {
    author: {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      id: req.user._id,
    },
    content: req.body.content,
    time: new Date(),
  };

  const post = await Post.create(new_post);
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { posts: post._id } }
  );

  res.redirect("/");
};

module.exports.getAll = async (req, res, next) => {
  const queryObj = req.user.following.map(id => {
    return { author: id };
  });

  queryObj.push({ author: req.user._id });
  // Apply filter for last 1 day
  const posts = await Post.find({ $or: queryObj });
  console.log(posts);
  next();
};

module.exports.comment = async (req, res, next) => {
  // if (!req.user || !req.body.content) {
  //   console.log("Server error add comment");
  //
  const new_comment = {
    author: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    },
    text: req.body.text,
  };

  await Post.findOneAndUpdate(
    { _id: req.params.post },
    { $push: { comments: new_comment } }
  );

  res.redirect("/");
};

module.exports.deletePost = (req, res) => {};
