const Group = require("../models/groupModel");
const User = require("../models/userModel");
const Member = require("../models/memberModel");
const GroupChat = require("../models/groupChatModel");
const mongoose = require("mongoose");

const loadGroups = async (req, res) => {
    try {
        const groups = await Group.find({ creator_id: req.session.user._id });
        res.render('group', { groups, port: process.env.PORT, })
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const group = new Group({
            creator_id: req.session.user._id,
            name,
            image: 'images/' + req.file.filename,
            limit: req.body.limit,
            description
        });
        await group.save();
        const groups = await Group.find({ creator_id: req.session.user._id });
        res.render('group', { message: name + ' group created successfully', port: process.env.PORT, groups })
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const getMembers = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'members',
                    localField: '_id',
                    foreignField: 'user_id',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$group_id', new mongoose.Types.ObjectId(req.body.group_id)] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'member'
                }
            },
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(req.session.user._id) }
                }
            },
        ])
        res.status(200).send({ success: true, data: users });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const addMembers = async (req, res) => {
    try {
        if (!req.body.members) {
            return res.status(200).send({ success: false, message: 'Please select at least one member' });
        }
        else if (req.body.members.length > parseInt(req.body.limit)) {
            return res.status(200).send({ success: false, message: 'You can add only ' + req.body.limit + ' members' });
        }

        await Member.deleteMany({ group_id: req.body.group_id });

        const members = req.body.members.map(member => {
            return {
                group_id: req.body.group_id,
                user_id: member
            }
        });
        await Member.insertMany(members);
        res.status(200).send({ success: true, message: "Members added successfully" });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
};

const updateGroup = async (req, res) => {
    try {
        if (parseInt(req.body.limit) < 1) {
            return res.status(200).send({ success: false, message: "Limit should be greater than 0" });
        } else if (parseInt(req.body.limit) < parseInt(req.body.last_limit)) {
            await Member.deleteMany({ group_id: req.body.id });
        }

        let updateObj;
        console.log("req" + req)
        if (req.file != undefined) {
            updateObj = {
                name: req.body.name,
                image: 'images/' + req.file.filename,
                limit: req.body.limit,
                description: req.body.description
            }
        } else {
            updateObj = {
                name: req.body.name,
                limit: req.body.limit,
                description: req.body.description
            }
        }
        const updatedGroup = await Group.findByIdAndUpdate(req.body.id, { $set: updateObj }, { new: true });

        return res.status(200).send({ success: true, message: "Group Update successfully", data: updatedGroup });

    } catch (error) {
        return res.status(400).send({ success: false, message: error.message });
    }
}

const deleteGroup = async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.body.id);
        await Member.deleteMany({ group: req.body.id });
        res.status(200).send({ success: true, message: "Group deleted successfully" });
    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const shareGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            res.render('error', { message: 'Group not found' })
        }
        else if (req.session.user == undefined) {
            res.render('error', { message: 'You need to login to access the Share URL!' })
        }
        else {
            const totalMembers = await Member.find({ group_id: req.params.id }).countDocuments();
            console.log(totalMembers)
            if (totalMembers == undefined) totalMembers = 0;
            const avilable = group.limit - totalMembers;
            const isOwner = group.creator_id == req.session.user._id;
            const isJoined = await Member.findOne({ group_id: req.params.id, user_id: req.session.user._id });
            res.render('shareLink', { group, totalMembers, avilable, isOwner, isJoined });
        }
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.body.group_id);
        if (!group) {
            res.status(200).send({ success: false, message: 'Group not found' });
        }
        else {
            const totalMembers = await Member.find({
                group_id: req.body.group_id
            }).countDocuments();
            if (totalMembers >= group.limit) {
                res.status(200).send({ success: false, message: 'Group limit reached' });
            }
            else {
                const member = new Member({
                    group_id: req.body.group_id,
                    user_id: req.session.user._id
                });
                await member.save();
                res.status(200).send({ success: true, message: "Congratulation, you have Joined the Group Successfully!" });
            }
        }
    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const groupChat = async (req, res) => {
    try {
        const myGroups = await Group.find({ creator_id: req.session.user._id });
        const joinedGroups = await Member.find({ user_id: req.session.user._id }).populate('group_id');


        res.render('chat-group', { myGroups, joinedGroups });

    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}

const saveGroupChat = async (req, res) => {
    try {
        const groupChat = new GroupChat({
            sender_id: req.body.sender_id,
            group_id: req.body.group_id,
            message: req.body.message
        });
        var newChat = await groupChat.save();
        res.status(200).send({ success: true, message: "Message sent successfully", chat: newChat });
    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
}


module.exports = {
    loadGroups,
    createGroup,
    getMembers,
    addMembers,
    updateGroup,
    deleteGroup,
    shareGroup,
    joinGroup,
    groupChat,
    saveGroupChat,
};