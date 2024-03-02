const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const registerLoad = (req, res) => {
  try {
    res.render("register");
  } catch (err) {
    console.log(err);
  }
};

const register = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file was uploaded.");
    }
    const { name, email, password } = req.body;
    // check if user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.render("register", { message: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const imageName = "images/" + req.file.filename;
    const user = new User({
      name,
      email,
      password: passwordHash,
      image: imageName,
    });
    await user.save();
    res.render("register", { message: "User registered successfully" });
  } catch (err) {
    console.log(err);
  }
};

const loginLoad = (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.render("login", {
        message: "Not found valid email please register first",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return res.render("login", {
        message: "Invalid password",
      });
    }

    req.session.user = userData;
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

const loadDashboard = async (req, res) => {
  try {
    var users = await User.find({ _id: { $nin: [req.session.user._id] } });
    console.log("users" + users);
    res.render("dashboard", { user: req.session.user, users: users , port:  process.env.PORT });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  registerLoad,
  register,
  loginLoad,
  login,
  logout,
  loadDashboard,
};
