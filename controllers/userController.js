const bcrypt = require("bcryptjs");
const User = require("../models/userModels");

module.exports.update = (req, res) => {
  res.render("update");
};

// find a user
module.exports.findUser = async (req, res) => {
  const user = await User.find({
    $or: [
      { email: req.body.query },
      { firstName: req.body.query },
      { lastName: req.body.query },
    ],
  });

  // return res.render("user", { users: user });
  res.json(user); // fix
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
