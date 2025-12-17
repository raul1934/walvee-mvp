const { validationResult } = require("express-validator");
const { buildErrorResponse } = require("../utils/helpers");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    return res
      .status(400)
      .json(
        buildErrorResponse("VALIDATION_ERROR", "Validation failed", details)
      );
  }

  next();
};

module.exports = { validate };
