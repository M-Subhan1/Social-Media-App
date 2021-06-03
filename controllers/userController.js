const bcrypt = require("bcryptjs");
const User = require("../models/userModels");

module.exports.update = (req, res) => {
  res.render("update");
};
// find a user
module.exports.findUsers = async (req, res) => {
  const users = await User.find({
    $or: [
      { email: req.body.query },
      { firstName: req.body.query },
      { lastName: req.body.query },
    ],
  });

  if (users.length < 3) {
    const moreUsers = await User.find();
    moreUsers.sort((a, b) => {
      b.tokenTime.getTime() - a.tokenTime.getTime();
    });

    for (let i = users.length; i < 3; i++) users.push(moreUsers[i]);
  }

  if (users.length > 3) for (let i = users.length; i > 3; i--) users.pop();

  res.render("searchUsers", {
    layout: "/layouts/dashboard",
    title: "Proj",
    users: users,
  });
};
// follow user
module.exports.follow = async (req, res) => {
  // if trying to follow myself, redirect
  if (req.user._id.toString() == req.params.id) return res.redirect("/");
  // the user who followed'
  const user = await User.find({ _id: req.params.id });

  if (typeof user == "undefined") return res.redirect("/");

  const match = req.user.following.filter(id => {
    return req.user.following == req.params.id;
  });

  console.log(match);

  if (match.length == 0) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: { following: req.params.id },
      }
    );

    // // the user who got followed
    await User.updateOne(
      { _id: req.params.id },
      {
        $push: { followers: req.user._id },
      }
    );
    console.log("success");
  }

  res.redirect("/");
};
// unfollow user
module.exports.unfollow = async (req, res) => {
  if (req.user._id.toString() == req.params.id) return res.redirect("/");

  console.log("HEllo");

  await User.updateOne(
    { _id: req.user._id },
    {
      $pull: { following: req.params.id },
    }
  );

  await User.updateOne(
    { _id: req.params.id },
    {
      $pull: { followers: req.user._id },
    }
  );

  res.redirect("/");
};
// User Profile
module.exports.profile = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });

  if (user == null) return res.redirect("/");

  res.render("userProfile", {
    layout: "./layouts/dashboard",
    user: user,
    same: req.user.id.toString() == user._id.toString(),
    followed: req.user.following.includes(user.id.toString()),
  });
};
