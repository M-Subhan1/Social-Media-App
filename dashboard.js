const Post = require("./models/postModel");

module.exports.profile = async (req, res) => {
  res.render("userProfile", { layout: "./layouts/dashboard" });
};

module.exports.mine = async (req, res) => {
  console.log("Hi");
  // Getting Posts
  const posts = await Post.find({ "author.id": req.user._id });
  // Sorting Posts
  posts.sort((a, b) => b.time.getTime() - a.time.getTime());
  res.render("dashboard", {
    posts: posts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
};

module.exports.populate = async (req, res) => {
  //
  const queryObj = req.user.following.map(id => {
    return { "author.id": id };
  });

  queryObj.push({ "author.id": req.user._id });
  // Apply filter for last 1 day

  const time = new Date();
  const posts = await Post.find({ $or: queryObj });
  const filteredPosts = posts.filter(post => {
    return time.getTime() - post.time.getTime() < 86400000;
  });

  filteredPosts.sort((a, b) => b.time.getTime() - a.time.getTime());

  res.render("dashboard", {
    posts: filteredPosts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
};
