require("dotenv").config();
const express = require("express");
const http = require("http");
const userRoute = require("./routes/userRoute");
const session = require("express-session");
const connectDB = require("./config/database");
const socketHandler = require("./socket/socketHandler");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/", userRoute);

const server = http.createServer(app);
const io = require("socket.io")(server);

const usp = io.of("/user-namespace");
socketHandler(usp);
connectDB();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on url http://localhost:${port}`);
});
