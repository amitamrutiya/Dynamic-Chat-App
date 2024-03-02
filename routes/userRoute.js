const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

const user_router = express.Router();

user_router.get("/",auth.isLogout, userController.loginLoad);
user_router.post("/", userController.login);
user_router.get("/register", auth.isLogout, userController.registerLoad);
user_router.post("/register", upload.single("image"), userController.register);
user_router.get("/logout", auth.isLogin, userController.logout);
user_router.get("/dashboard", auth.isLogin, userController.loadDashboard);

user_router.get("*", (req, res) => {
  res.redirect("/");
});

module.exports = user_router;
