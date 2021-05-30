const Post = require("./models/postModel");

module.exports.populate = async (req, res) => {
  //
  const queryObj = req.user.following.map(id => {
    return { "author.id": id };
  });

  queryObj.push({ "author.id": req.user._id });
  // Apply filter for last 1 day
  const posts = await Post.find({ $or: queryObj });

  res.render("dashboard", {
    posts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
};
