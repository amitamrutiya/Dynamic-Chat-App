require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  });

// Define a route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create HTTP server and pass express app as callback
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
