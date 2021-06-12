const Post = require("./models/postModel");
const User = require("./models/userModels");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },

  filename: (req, file, cb) => {
    // Naming files
    const extenstion = file.mimetype.split("/")[1];
    const name = `user-${req.user._id}-${Date.now()}.${extenstion}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

module.exports.uploadPhoto = upload.single("image");

module.exports.profile = async (req, res) => {
  try {
    return res.render("userProfile", {
      layout: "./layouts/dashboardLayout",
      user: req.user,
      same: true,
    });
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.updateProfile = async (req, res) => {
  console.log(req.file);
  try {
    const user_properties = new Object({
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
    });

    if (req.file) user.photo = req.file.filename;

    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: user_properties,
      }
    );
    // Updating username in posts
    await Post.updateMany(
      {
        "author.id": req.user._id,
      },

      {
        $set: {
          "author.firstName": req.body.firstName,
          "author.lastName": req.body.lastName,
        },
      }
    );

    return res.redirect("/profile");
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.mine = async (req, res) => {
  try {
    // Getting Posts
    const filteredPosts = await Post.find({ "author.id": req.user._id });
    // Sorting Posts
    res.render("timeline", {
      posts: filteredPosts,
      layout: "./layouts/dashboardLayout",
      name: req.user.firstName,
    });
  } catch {
    res.status(404).send("Error: 404");
  }
};

module.exports.populate = async (req, res) => {
  try {
    // Making a query object
    const queryObj = req.user.following.map(id => {
      return { "author.id": id };
    });

    queryObj.push({ "author.id": req.user._id });

    // Filtering posts
    const time = new Date(); // current time obj
    const posts = await Post.find({ $or: queryObj }); // posts
    const filteredPosts = posts.filter(post => {
      return time.getTime() - post.time.getTime() < 259200000;
    });

    // Sorting posts by time (most recent first)
    filteredPosts.sort((a, b) => b.time.getTime() - a.time.getTime());

    // Rendering webpage
    return res.render("dashboard", {
      user: req.user,
      posts: filteredPosts,
      layout: "./layouts/dashboardLayout",
      name: req.user.firstName,
    });
  } catch {
    res.status(404).send("Error: 404");
  }
};
