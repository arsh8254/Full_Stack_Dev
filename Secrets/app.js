//jshint esversion:6

// some special packages required only for authentication part
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// from the documentation of "express-session" package
app.use(session({
  secret: "Our little secret",   // can be any string we want
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

// we need to create special mongoose schema so that we can use the ("mongoose-encryption package")
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,   // to store unique id of google user 
  secret: String
});

// from the documentation to add plugin into mongoose schema
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// plugins must be written before writing the code for model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// directly from passport docs
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// directly from passport docs
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// to use sign in with google option using oAuth2.0
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"  //added as google-plus is deprecated
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    // can be used after installing its custom package
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("home");
});

// when we click on "sign in with google" this will activate
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

// after google login, user will be redirected back to our website
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, then redirected to secrets page
    res.redirect("/secrets");
  });

// renders the login page
app.get("/login", function(req, res){
  res.render("login");
});

// renders the register page
app.get("/register", function(req, res){
  res.render("register");
});


app.get("/secrets", function(req, res){
  // it will find all secret fields which are not null
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

// renders the secret page upon authentication
app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

// users can submit their own secrets and see the secrets page
app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;
// Once the user is authenticated and their session gets saved, their user details are saved to req.user
// console.log(req.user.id);
  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

// redirected to homepage after logging out
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){
  // users will type out their username and password they want in the form
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){   // local authentication
      res.redirect("/secrets");  // just after registering they can view secrets page
      });
    }
  });
});

app.post("/login", function(req, res){
  // user created with authentication details
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  // if login with correct details then go to secrets page
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
        passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

// to run locally
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
