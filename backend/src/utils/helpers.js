const { v4: uuidv4 } = require("uuid");

const generateUUID = () => {
  return uuidv4();
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
};
