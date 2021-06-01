const Post = require("./models/postModel");

module.exports.profile = async (req, res) => {
  res.render("userProfile", { layout: "./layouts/dashboard", user: req.user });
};

module.exports.mine = async (req, res) => {
  // Getting Posts
  console.log("Hi");
  const filteredPosts = await Post.find({ "author.id": req.user._id });
  // Sorting Posts
  res.render("timeline", {
    posts: filteredPosts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
  console.log(filteredPosts);
};

module.exports.populate = async (req, res) => {
  // Making a query object
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
  // Sorting posts by time (most recent first)
  filteredPosts.sort((a, b) => b.time.getTime() - a.time.getTime());
  // Rendering webpage
  res.render("dashboard", {
    posts: filteredPosts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
};
