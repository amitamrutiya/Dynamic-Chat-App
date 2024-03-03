const isLogin = (req, res, next) => {
  try {
    if (req.session.user && req.cookies.user) {
      return next();
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

const isLogout = (req, res, next) => {
  try {
    if (!req.session.user && !req.cookies.user) {
      return next();
    }
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isLogin, isLogout };
