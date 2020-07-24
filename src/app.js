const express = require("express");
const bodyParser = require("body-parser");

app = express();

app.use(bodyParser());

// Setting view rendering engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'))
app.engine('html', require('ejs').renderFile);

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
