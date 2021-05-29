const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "Comments must have an author"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Comments must have content"],
    trim: true,
  },
});

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "Post Must have an author"],
    trim: true,
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
