const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: {
    firstName: {
      type: String,
      required: [true, "Comment Author must have a firstname"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Comment Author must have a lastname"],
      trim: true,
    },
    id: {
      type: String,
      required: [true, "Comment Author must have an id"],
      trim: true,
    },
  },

  content: {
    type: String,
    required: [true, "Comments must have content"],
    trim: true,
  },
});

const postSchema = new mongoose.Schema({
  author: {
    firstName: {
      type: String,
      required: [true, "Comment Author must have a firstname"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Comment Author must have a lastname"],
      trim: true,
    },
    id: {
      type: String,
      required: [true, "Comment Author must have an id"],
      trim: true,
    },
  },

  image: {
    type: String,
  },

  content: {
    type: String,
    required: [true, "Post Must have some content"],
    trim: true,
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
  time: {
    type: Date,
    required: [true, "Post must have a publish time"],
  },
});

const Post = mongoose.model("Posts", postSchema);

module.exports = Post;
