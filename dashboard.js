const Post = require("./models/postModel");
const User = require("./models/userModels");

module.exports.profile = async (req, res) => {
  return res.render("userProfile", {
    layout: "./layouts/dashboard",
    user: req.user,
  });
};

module.exports.updateProfile = async (req, res) => {
  await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        about: req.body.about,
        address: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip,
        },
      },
    }
  );
  return res.redirect("/profile");
};

module.exports.mine = async (req, res) => {
  // Getting Posts
  const filteredPosts = await Post.find({ "author.id": req.user._id });
  // Sorting Posts
  res.render("timeline", {
    posts: filteredPosts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
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
  return res.render("dashboard", {
    user: req.user,
    posts: filteredPosts,
    layout: "./layouts/dashboard",
    name: req.user.firstName,
  });
};
