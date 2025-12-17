const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    config.jwt.secret,
    { expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
