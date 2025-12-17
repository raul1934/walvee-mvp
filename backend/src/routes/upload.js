const express = require("express");
const rateLimit = require("express-rate-limit");
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middleware/auth");
const config = require("../config/config");

const router = express.Router();

// Rate limiter for uploads
const uploadLimiter = rateLimit(config.uploadRateLimit);

// Upload image
router.post(
  "/image",
  authenticate,
  uploadLimiter,
  uploadController.upload.single("file"),
  uploadController.uploadImage
);

// Upload file
router.post(
  "/file",
  authenticate,
  uploadLimiter,
  uploadController.upload.single("file"),
  uploadController.uploadFile
);

// Delete file
router.delete("/:filename(*)", authenticate, uploadController.deleteFile);

module.exports = router;
