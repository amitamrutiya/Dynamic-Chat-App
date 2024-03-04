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
group_router.post("/delete-group", auth.isLogin, groupController.deleteGroup);
group_router.get("/share-group/:id", groupController.shareGroup);
group_router.post("/join-group", auth.isLogin, groupController.joinGroup);
group_router.get("/group-chat", auth.isLogin, groupController.groupChat);
group_router.post("/group-chat-save", auth.isLogin, groupController.saveGroupChat);
group_router.post("/load-group-chat", auth.isLogin, groupController.loadGroupChats);

module.exports = group_router;
