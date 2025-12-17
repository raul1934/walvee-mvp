const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");
const {
  buildSuccessResponse,
  buildErrorResponse,
  generateUUID,
} = require("../utils/helpers");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(config.upload.directory, req.user.id);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${generateUUID()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (req.path.includes("/image")) {
    if (config.upload.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter,
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "No file provided"));
    }

    const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;

    res.json(
      buildSuccessResponse({
        fileUrl: `${req.protocol}://${req.get("host")}${fileUrl}`,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to upload image")
      );
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(buildErrorResponse("VALIDATION_ERROR", "No file provided"));
    }

    const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;

    res.json(
      buildSuccessResponse({
        fileUrl: `${req.protocol}://${req.get("host")}${fileUrl}`,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to upload file")
      );
  }
};

const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Extract user ID from filename path
    const fileUserId = filename.split("/")[0];

    if (fileUserId !== userId) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            "FORBIDDEN",
            "You do not have permission to delete this file"
          )
        );
    }

    const filePath = path.join(config.upload.directory, filename);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "File not found"));
    }

    fs.unlinkSync(filePath);

    res.json(buildSuccessResponse({ message: "File deleted successfully" }));
  } catch (error) {
    res
      .status(500)
      .json(
        buildErrorResponse("INTERNAL_SERVER_ERROR", "Failed to delete file")
      );
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadFile,
  deleteFile,
};
