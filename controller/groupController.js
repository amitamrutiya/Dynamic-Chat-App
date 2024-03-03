const Group = require("../models/groupModel");
const User = require("../models/userModel");
const Member = require("../models/memberModel");

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
        const users = await User.find({ _id: { $nin: req.session.user._id } })
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

module.exports = {
    loadGroups,
    createGroup,
    getMembers,
    addMembers,
};