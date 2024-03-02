const Chat = require("../models/chatModel");

const saveChat = async (req, res) => {
  try {
    const { message, sender_id, receiver_id } = req.body;
    const chat = new Chat({
      sender_id,
      receiver_id,
      message,
    });
    var newChat = await chat.save();
    res
      .status(200)
      .send({
        success: true,
        message: "Chat saved successfully",
        data: newChat,
      });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
};

module.exports = {
  saveChat,
};
