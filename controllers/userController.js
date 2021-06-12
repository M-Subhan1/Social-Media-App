const User = require("../models/userModels");

module.exports.update = (req, res) => {
  res.render("update");
};
// find a user
module.exports.findUsers = async (req, res, next) => {
  // Finding query
  try {
    if (req.body.query.trim() == "") return next();

    const query = req.body.query
      .trim()
      .split(" ")
      .map(el => el[0].toUpperCase() + el.slice(1));

    // const queryString = query.join(" ");
    const users = await User.find({
      $or: [{ email: query }, { firstName: query }, { lastName: query }],
    });

    const config = new Object({
      layout: "layouts/dashboardLayout.ejs",
      title: "Proj",
      users,
    });

    res.render("searchResults", config);
  } catch {
    res.status(404).send("Error: 404");
  }
};
// follow user
module.exports.follow = async (req, res) => {
  try {
    // if users tries to follow itself, redirect
    if (req.user._id.toString() == req.params.id) return res.redirect("/");

    // finding the user that was requested to be followed
    const user = await User.find({ _id: req.params.id });

    // if user does not exist redirect
    if (typeof user == "undefined") return res.redirect("/");

    // checking if the user making the request has already followed the other user
    const match = req.user.following.filter(id => {
      return req.user.following == req.params.id;
    });

    // if not already following, follow (update the following array for the one making the request, followed array for the user requested to be followed)
    if (match.length == 0) {
      // Upadting The user making follow request
      await User.updateOne(
        { _id: req.user._id },
        {
          $push: { following: req.params.id },
        }
      );

      // Updating the user who got followed
      await User.updateOne(
        { _id: req.params.id },
        {
          $push: { followers: req.user._id },
        }
      );
    }

    // On success redirecting to dashboard
    res.redirect("/");
  } catch {
    // Sending error 404
    res.status(404).send("Error: 404");
  }
};
// unfollow user
module.exports.unfollow = async (req, res) => {
  try {
    if (req.user._id.toString() == req.params.id) return res.redirect("/");

    // Updating the user that unfollowed
    await User.updateOne(
      { _id: req.user._id },
      {
        $pull: { following: req.params.id },
      }
    );

    // Updating the user that got unfollowed
    await User.updateOne(
      { _id: req.params.id },
      {
        $pull: { followers: req.user._id },
      }
    );

    // Redirecting to dashboard on success
    res.redirect("/");
  } catch {
    // Sending error 404
    res.status(404).send("Error: 404");
  }
};
// User Profile
module.exports.profile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (user == null) return res.redirect("/");

    res.render("userProfile", {
      layout: "./layouts/dashboardLayout",
      user: user,
      same: req.user.id.toString() == user._id.toString(),
      followed: req.user.following.includes(user.id.toString()),
    });
  } catch {
    // Sending error 404
    res.status(404).send("Error: 404");
  }
};
