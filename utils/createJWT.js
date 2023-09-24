const jwt = require("jsonwebtoken");

const createJWT = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_SECRET,
  });

module.exports = createJWT;
