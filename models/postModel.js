const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({});

const Post = mongoose.model("Posts", postSchema);

module.exports = Post;
