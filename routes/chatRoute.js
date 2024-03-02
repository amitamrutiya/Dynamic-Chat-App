const express = require("express");
const chatController = require("../controller/chatController");
const auth = require("../middleware/auth");

const chat_router = express.Router();
chat_router.post("/save-chat", auth.isLogin, chatController.saveChat);
chat_router.post("/delete-chat", auth.isLogin, chatController.deleteChat);

module.exports = chat_router;
