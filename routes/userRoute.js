const express = require("express");
const user_router = express.Router();
const User = require("../models/userModel");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const session = require("express-session");
const userController = require("../controller/userController");
require("dotenv").config();

user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({ extended: true }));
user_router.use(express.static("public"));
user_router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

user_router.get("/", userController.loginLoad);
user_router.post("/", userController.login);
user_router.get("/register", userController.registerLoad);
user_router.post("/register", upload.single("image"), userController.register);
user_router.get("/logout", userController.logout);
user_router.get("/dashboard", userController.loadDashboard);
user_router.get("*", (req, res) => {
  res.redirect("/");
});
module.exports = user_router;
