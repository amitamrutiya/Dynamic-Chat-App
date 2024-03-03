const express = require("express");
const groupController = require("../controller/groupController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

const group_router = express.Router();
group_router.get("/groups", auth.isLogin, groupController.loadGroups);
group_router.post("/groups", auth.isLogin, upload.single("image"), groupController.createGroup);

module.exports = group_router;
