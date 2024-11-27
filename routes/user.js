const { Router } = require("express");
const User = require("../models/user");
const { createToken, validateToken } = require("../services/auth");
const router = Router();

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPassword(email, password);
    // console.log(token);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    res.render("signin", {
      error: "incorrect email or password",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  const token = createToken({ fullName, email, password });
  return res.cookie("token", token).redirect("/");
});

router.get("/logout", (req, res) => {
  return res.clearCookie("token").redirect("/");
});
module.exports = router;
