const bcrypt = require("bcryptjs");
const User = require("../models/userModels");

module.exports.update = (req, res) => {
  res.render("update");
};

// find a user
module.exports.findUser = async (req, res) => {
  console.log(req.params);
  const user = await User.find({
    $or: [
      { email: req.params.email },
      { firstName: req.params.email },
      { lastName: req.params.email },
      { id: req.params.email },
    ],
  });

  return res.render("user", { users: user });
  res.json(user); // fix
};

// follow user
module.exports.follow = async (req, res) => {
  //
  console.log(req.user.email, req.params.email);
  if (req.user.email == req.params.email) return res.redirect("/");

  const user = await User.findOne({ email: req.params.email });
  // the user who followed'

  console.log(req.user.following.find(email => user.email == email));

  if (
    typeof req.user.following.find(email => user.email == email) ==
      "undefined" ||
    req.user.following.find(email => user.email == email) == []
  ) {
    req.user.following.push(user.email);
    user.followers.push(req.user.email);
  } else return res.redirect("/");

  console.log(req.user.following, user.followers);

  await User.updateOne(
    { email: req.user.email },
    {
      $set: { following: req.user.following },
    }
  );

  // // the user who got followed
  await User.updateOne(
    { email: req.params.email },
    {
      $set: { followers: user.followers },
    }
  );

  res.redirect("/");
};

// unfollow user
module.exports.unfollow = async (req, res) => {
  //
  if (req.user.email == req.params.email) return res.redirect("/");

  const user = await User.findOne({ email: req.params.email });
  // can be made better
  const following = req.user.following.filter(email => email != user.email);
  const followers = user.followers.filter(email => email != req.user.email);

  await User.updateOne(
    { email: req.user.email },
    {
      $set: { following: following },
    }
  );

  // // the user who got followed
  await User.updateOne(
    { email: req.params.email },
    {
      $set: { followers: followers },
    }
  );

  return res.redirect("/");
};
