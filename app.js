require("dotenv").config();
const express = require("express");
const http = require("http");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const groupRoute = require("./routes/groupRoute");
const session = require("express-session");
const connectDB = require("./config/database");
const socketHandler = require("./socket/socketHandler");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
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
app.use("/", chatRoute);
app.use("/", groupRoute);

app.get("*", (req, res) => {
  res.redirect("/");
});

const server = http.createServer(app);
const io = require("socket.io")(server);

const usp = io.of("/user-namespace");
socketHandler(usp);
connectDB();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on url http://localhost:${port}`);
});
