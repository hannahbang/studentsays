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

  res.locals.req = req;

  next();
});

app.get("/", (req, res) => {
  if (req.user) {
    res.redirect("/feed");
  } else {
    res.render("index.html");
  }
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

app.get("/feed", async (req,res) => {
  if (req.user) {
    let posts = await postModel.find({}).sort({ datetimePosted: -1 });

    // ADDING CREATOR TO EACH POST
    for (var i = 0; i < posts.length; i++) {
      let creator;
      if (!posts[i].anonymous) {
        creator = await userModel.findOne({ _id: posts[i].creatorId });
      } else {
        creator = null;
      }
      posts[i] = { ...posts[i], creator };
    }

    res.render("feed.html", { posts });
  } else {
    res.redirect("/login");
  }
});

app.get("/post/:id", (req, res) => {
  const postId = req.params.id;
  postModel.findOne({ _id: postId }, (err, post) => {
    if (err) {
      res.send("That post doesn't exist.");
    } else {
      res.render("post.html", { post });
    }
  });
});

app.route("/user/:username")
  .get(async (req, res) => {
    const username = req.params.username;
    if (req.user) {
      const user = await userModel.findOne({ username });
      if (user) {
        // GET POSTS
        let posts = await postModel.find({ creatorId: user._id }).sort({ datetimePosted: -1 });

        // ADDING CREATOR TO EACH POST
        for (var i = 0; i < posts.length; i++) {
          let creator = await userModel.findOne({ _id: posts[i].creatorId });
          posts[i] = { ...posts[i], creator };
        }

        res.render("user.html", { user, posts });
      } else {
        res.send("That user doesn't exist.");
      }
    } else {
      res.redirect("/login");
    }
  })
  .delete(async (req, res) => {
    if (req.user) {
      // REMOVING ALL USER POSTS FROM DB
      const posts = await postModel.deleteMany({ creatorId: req.user._id });

      // REMOVING USER FROM DB
      const user = await userModel.deleteOne({ _id: req.user._id });

      // REMOVING USER FROM COOKIES
      const authToken = res.cookie("authToken");
      delete authTokens[authToken];
      res.clearCookie("authToken");
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  });

app.route("/user/:username/post")
  .get(async (req, res) => {
    const username = req.params.username;
    if (req.user) {
      const user = await userModel.findOne({ username });
      if (user) {
        if (req.user.username == user.username) {
          res.render("make-post.html", { user });
        } else {
          res.send("You don't have permission to make a post for this profile.");
        }
      } else {
        res.send("That user doesn't exist.");
      }
    } else {
      res.redirect("/login");
    }
  })
  .post(async (req, res) => {
    const username = req.params.username;
    if (req.user) {
      const user = await userModel.findOne({ username });
      if (user) {
        if (req.user.username == user.username) {
          const title = req.body.title;
          const content = req.body.content;
          const anonymous = req.body.anonymous == "on" ? true : false;
          const creatorId = user._id;

          const newPost = new postModel({ title, content, creatorId, anonymous, datetimePosted: new Date() });
          newPost.save((err, post) => {
            if (err) throw err;

            res.redirect("/feed");
          })
        } else {
          res.send("You don't have permission to make a post for this profile.");
        }
      } else {
        res.send("That user doesn't exist.");
      }
    } else {
      res.redirect("/login");
    }
  });

app.route("/user/:username/edit")
  .get(async (req, res) => {
    const username = req.params.username;
    if (req.user) {
      const user = await userModel.findOne({ username });
      if (user) {
        if (req.user.username == user.username) {
          res.render("edit-user.html", { user });
        } else {
          res.send("You don't have permission to edit this profile.");
        }
      } else {
        res.send("That user doesn't exist.");
      }
    } else {
      res.redirect("/login");
    }
  })
  .post(async (req, res) => {
    const updateUserObj = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username
    }

    await userModel.findOneAndUpdate({ username: req.user.username }, updateUserObj);
    const user = await userModel.findOne({ username: req.user.username });

    // RESETTING AUTH TOKEN ALIAS
    const authToken = req.cookies.authToken;
    authTokens[authToken] = user;

    res.redirect("/user/" + user.username)
  })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[+] Server listening on port ${PORT}...`);
});
