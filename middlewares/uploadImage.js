const path = require("path");
const multer = require("multer");

const uploadImage = (image, folder = "uploads") => {
  const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
      callBack(null, `public/${folder}/`);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${extension}`);
    },
  });

  return multer({ storage }).single(image);
};

module.exports = uploadImage;
