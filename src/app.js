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

app.route("/login")
  .get((req, res) => {
    res.render("login.html");
  })
  .post(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await userModel.findOne({ username, password });
    if (user) {
      res.send("Correct");
    } else {
      res.send("Incorrect");
    }
  });

app.route("/register")
  .get((req, res) => {
    res.render("register.html");
  })
  .post((req, res) => {
    const newUser = new userModel({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    newUser.save((err, user) => {
      if (err) throw err;
      res.redirect("/feed");
    });
  })

app.get("/feed", (req,res) => {
  res.render("feed.html");
});

app.get("/profile", (req, res) => {
  res.render("profile.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[+] Server listening on port ${PORT}...`);
});
