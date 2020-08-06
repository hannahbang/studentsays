const mongoose = require("mongoose");

// SCHEMAS
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  birthday: Date,
  gender: String,
  ethnicity: String,
  school: Object
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  datetimePosted: Date,
  category: String,
  creatorId: String,
  anonymous: Boolean
});

const commentSchema = new mongoose.Schema({
  postId: String,
  content: String,
  datetimePosted: Date,
  creatorId: String,
  anonymous: Boolean
});

// MODELS
const userModel = mongoose.model("User", userSchema);
const postModel = mongoose.model("Post", postSchema);
const commentModel = mongoose.model("Comment", commentSchema);

module.exports = { userModel, postModel, commentModel };
