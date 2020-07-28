const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passwordHash = require("password-hash");
const { userModel, postModel } = require("./models.js");

app = express();

app.use(bodyParser());
app.use(cookieParser());

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

const authTokens = {};

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

app.use((req, res, next) => {
  const authToken = req.cookies["authToken"];
  req.user = authTokens[authToken];
  next();
});

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

    const user = await userModel.findOne({ username });
    if (user) {
      const correctPassword = passwordHash.verify(password, user.password);
      if (correctPassword) {
        const authToken = generateAuthToken();
        authTokens[authToken] = user;
        res.cookie('authToken', authToken);

        res.redirect("/feed");
      } else {
        res.send("Incorrect password.");
      }
    } else {
      res.send("Incorrect username.");
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
      password: passwordHash.generate(req.body.password)
    });
    newUser.save((err, user) => {
      if (err) throw err;
      res.redirect("/feed");
    });
  });

app.get("/logout", (req, res) => {
  delete authTokens[res.cookie("authToken")];
  res.clearCookie("authToken");
  res.redirect("/");
})

app.get("/feed", (req,res) => {
  if (req.user) {
    res.render("feed.html");
  } else {
    res.redirect("/login");
  }
});

app.get("/profile", (req, res) => {
  if (req.user) {
    res.render("profile.html");
  } else {
    res.redirect("/login");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[+] Server listening on port ${PORT}...`);
});
