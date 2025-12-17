const { verifyToken } = require("../utils/jwt");
const { buildErrorResponse } = require("../utils/helpers");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(buildErrorResponse("UNAUTHORIZED", "No token provided"));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res
        .status(401)
        .json(buildErrorResponse("UNAUTHORIZED", "Invalid or expired token"));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(buildErrorResponse("UNAUTHORIZED", "Authentication failed"));
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
