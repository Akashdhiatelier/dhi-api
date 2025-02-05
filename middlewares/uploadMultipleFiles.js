const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype.startsWith("multipart")) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

// Initialize upload
const uploadMultipleFiles = multer({ storage, fileFilter });

module.exports = uploadMultipleFiles;
