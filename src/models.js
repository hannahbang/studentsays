const mongoose = require("mongoose");

// SCHEMAS
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  posts: Array
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  creatorId: String
});

// MODELS
const userModel = mongoose.model("User", userSchema);
const postModel = mongoose.model("Post", postSchema);

module.exports = { userModel, postModel };
