const Post = require("../models/postModel");

module.exports.post = async (req, res, next) => {
  // Error
  if (!req.user || !req.body.content) {
    console.log("Server error");
  }

  const new_post = {
    author: req.body.author,
    content: req.body.content,
    time: new Date(),
  };

  await Post.create(new_post);
  console.log("successfully posted");
  next(); // remove this later

  //   req.flash("message", "Successfully Posted!!");
  //   res.redirect("/");
};
