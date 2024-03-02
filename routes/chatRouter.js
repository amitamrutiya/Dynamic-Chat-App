const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");

const chat_router = express.Router();
chat_router.get("/", auth.isLogout, userController.loginLoad);
chat_router.post("/", userController.login);


module.exports = chat_router;
