require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const userRoute = require("./routes/userRoute");

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
  });

app.set("view engine", "ejs");
app.set("views", "views");

// Create HTTP server and pass express app as callback
const server = http.createServer(app);
app.use("/", userRoute);

server.listen(port, () => {
  console.log(`Server running on url http://localhost:${port}`);
});
