const jwt = require("jsonwebtoken");

const secret = "oyekyadekhrahah";

function createToken(user) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "30m" });
  return token;
}

function validateToken(token) {
  const payload = jwt.verify(token, secret);
  return payload;
}

module.exports = { createToken, validateToken };
