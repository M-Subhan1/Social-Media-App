const Post = require("../models/postModel");
const User = require("../models/userModels");

module.exports.post = async (req, res) => {
  // Error
  if (req.body.content.trim() != "") {
    const new_post = {
      author: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        id: req.user._id,
      },
      content: req.body.content,
      time: new Date(),
    };

    const post = await Post.create(new_post);
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { posts: post._id } }
    );
  }

  res.redirect("/");
};

module.exports.comment = async (req, res, next) => {
  //
  if (req.body.text.trim() == "") return res.redirect("/");

  const new_comment = {
    author: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    },
    text: req.body.text,
  };

  await Post.findOneAndUpdate(
    { _id: req.params.post },
    { $push: { comments: new_comment } }
  );

  res.redirect("/");
};

module.exports.deletePost = async (req, res) => {
  console.log(req.user.posts.includes(req.params.post));
  if (req.user.posts.includes(req.params.post)) {
    await Post.findOneAndDelete({ _id: req.params.post });
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { posts: req.params.post } }
    );
  }

  return res.redirect("/");
};

// module.exports.getAll = async (req, res, next) => {
//   const queryObj = req.user.following.map(id => {
//     return { author: id };
//   });

//   queryObj.push({ author: req.user._id });
//   // Apply filter for last 1 day
//   const posts = await Post.find({ $or: queryObj });
//   console.log(posts);
//   next();
// };
