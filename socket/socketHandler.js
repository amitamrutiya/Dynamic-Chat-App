const User = require("../models/userModel");
const Chat = require("../models/chatModel");

module.exports = function (usp) {
  usp.on("connection", async (socket) => {
    const userId = socket.handshake.auth.token;
    const username = socket.handshake.auth.name;
    console.log(username + " connected");

    try {
      await User.findByIdAndUpdate(userId, {
        $set: { is_online: true },
      });
    } catch (error) {
      console.error(error);
    }

    socket.broadcast.emit("getOnlineUser", { user_id: userId });
    socket.on("disconnect", async () => {
      const userId = socket.handshake.auth.token;
      const username = socket.handshake.auth.name;
      console.log(username + " disconnected");

      try {
        await User.findByIdAndUpdate(userId, {
          $set: { is_online: false },
        });
      } catch (error) {
        console.error(error);
      }

      socket.broadcast.emit("getOfflineUser", { user_id: userId });
    });

    // chatting implementation
    socket.on("newChat", (data) => {
      socket.broadcast.emit('loadNewChat', data);
    });

    // load old chats
    socket.on('existsChat', async (data) => {
      const { sender_id, receiver_id } = data;
      const chats = await Chat.find({
        $or: [
          { sender_id: receiver_id, receiver_id: sender_id },
          { sender_id, receiver_id },
        ],
      });

      socket.emit('loadOldChat', chats);
    });
  });
};
