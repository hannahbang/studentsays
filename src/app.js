const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { userModel, postModel } = require("./models.js");

app = express();

app.use(bodyParser());

// Setting view rendering engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'))
app.engine('html', require('ejs').renderFile);

// Mongoose configuration
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/studentsays";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get("/", (req, res) => {
  res.render("index.html");
});

// /login
app.get("/login", (req, res) => {
  res.render("login.html");
});

// /register
app.get("/register", (req, res) => {
  res.render("register.html");
})
// /dashboard
app.get("/dashboard", (req,res) => {
  res.render("dashboard.html");
})
// profile
app.get("/profile"), (req, res) => {
  res.render("profile.html");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[+] Server listening on port ${PORT}...`);
});
