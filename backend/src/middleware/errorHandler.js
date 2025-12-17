const { buildErrorResponse } = require("../utils/helpers");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Helper to add debug info to error response
  const addDebugInfo = (response) => {
    response.error.stack = err.stack;
    response.error.details = err.sql || err.sqlMessage || err.details || null;
    response.error.originalMessage = err.message;
    return response;
  };

  // Validation errors
  if (err.name === "ValidationError") {
    const response = buildErrorResponse(
      "VALIDATION_ERROR",
      "Validation failed",
      err.details || []
    );
    return res.status(400).json(addDebugInfo(response));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const response = buildErrorResponse(
      "UNAUTHORIZED",
      "Invalid or expired token"
    );
    return res.status(401).json(addDebugInfo(response));
  }

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    const response = buildErrorResponse("VALIDATION_ERROR", "Duplicate entry", [
      err.sqlMessage,
    ]);
    return res.status(400).json(addDebugInfo(response));
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    const response = buildErrorResponse(
      "RESOURCE_NOT_FOUND",
      "Referenced resource not found"
    );
    return res.status(404).json(addDebugInfo(response));
  }

  // Custom errors
  if (err.statusCode) {
    const response = buildErrorResponse(
      err.code || "ERROR",
      err.message,
      err.details || []
    );
    return res.status(err.statusCode).json(addDebugInfo(response));
  }

  // Default server error
  const response = buildErrorResponse(
    "INTERNAL_SERVER_ERROR",
    err.message || "An unexpected error occurred"
  );
  return res.status(500).json(addDebugInfo(response));
};

const notFound = (req, res) => {
  res
    .status(404)
    .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Route not found"));
};

module.exports = {
  errorHandler,
  notFound,
};
