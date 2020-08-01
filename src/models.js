const mongoose = require("mongoose");

// SCHEMAS
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  datetimePosted: Date,
  creatorId: String,
  anonymous: Boolean
});

// MODELS
const userModel = mongoose.model("User", userSchema);
const postModel = mongoose.model("Post", postSchema);

module.exports = { userModel, postModel };
