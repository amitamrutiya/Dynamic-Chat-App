const User = require("../models/userModel");

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
  });
};
