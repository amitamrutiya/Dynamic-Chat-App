const express = require("express");
const groupController = require("../controller/groupController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

const group_router = express.Router();
group_router.get("/", auth.isLogin, groupController.loadGroups);
group_router.post("/", auth.isLogin, upload.single("image"), groupController.createGroup);
group_router.post("/get-members", auth.isLogin, groupController.getMembers);
group_router.post("/add-members", auth.isLogin, groupController.addMembers);
group_router.post("/update-group", auth.isLogin, upload.single("image"), groupController.updateGroup);

module.exports = group_router;
