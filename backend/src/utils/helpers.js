const { v4: uuidv4 } = require("uuid");

const generateUUID = () => {
  return uuidv4();
};

/**
 * Converts a relative image path to a full URL
 * @param {string} imagePath - The relative or absolute image path
 * @returns {string|null} - Full URL or null if no path provided
 */
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath; // Already a full URL
  }
  const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const paginate = (page = 1, limit = 20, maxLimit = 100) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
};

const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

const buildSuccessResponse = (data, pagination = null) => {
  const response = {
    success: true,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

const buildErrorResponse = (code, message, details = []) => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
};

module.exports = {
  generateUUID,
  paginate,
  buildPaginationMeta,
  buildSuccessResponse,
  buildErrorResponse,
  getFullImageUrl,
};
