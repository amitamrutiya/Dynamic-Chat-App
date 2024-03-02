require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const userRoute = require("./routes/userRoute");
const app = express();
const port = process.env.PORT || 3000;
const User = require("./models/userModel");

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", "views");

const server = http.createServer(app);
const io = require("socket.io")(server);
app.use("/", userRoute);

const usp = io.of("/user-namespace");

usp.on("connection", async (socket) => {
  const userId = socket.handshake.auth.token;
  const username = socket.handshake.auth.name;
  console.log(username + " connected");

  await User.findByIdAndUpdate(userId, {
    $set: { is_online: true },
  });

  socket.broadcast.emit("getOnlineUser", { user_id: userId });
  socket.on("disconnect", async () => {
    const userId = socket.handshake.auth.token;
    const username = socket.handshake.auth.name;
    console.log(username + " disconnected");

    await User.findByIdAndUpdate(userId, {
      $set: { is_online: false },
    });

    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });
});

server.listen(port, () => {
  console.log(`Server running on url http://localhost:${port}`);
});
