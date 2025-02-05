const { StatusCodes } = require("http-status-codes");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const CusomError = require("../utils/customError");
const catchAsync = require("../utils/catchAsync");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = (image) => {
  if (image) {
    return multer({ storage }).single(image);
  }
};

const optimizeAndSaveImage = catchAsync(async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const file = path.join(__dirname, "..", "public", "uploads", req.file.filename);

    const optimizedBuffer = await sharp(file).webp().toBuffer();
    const optimizedFileName = req.file.filename.replace(/\.\w+$/, ".webp");

    const thumbBuffer = await sharp(file).resize({ width: 200, height: 200 }).webp({ quality: 80 }).toBuffer();
    const thumbName = req.file.filename.replace(/\.\w+$/, ".webp");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(`public/thumbnails/${thumbName}`, thumbBuffer, (error) => {
      if (error) {
        throw new CusomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
      }
    });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(`public/uploads/${optimizedFileName}`, optimizedBuffer, (error) => {
      if (error) {
        throw new CusomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
      }
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/uploads/${req.file.filename}`, (err) => {
        if (err) {
          throw new CusomError(StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
        req.file.filename = optimizedFileName;
        next();
      });
    });
  } catch (error) {
    throw new CusomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
});

module.exports = { upload, optimizeAndSaveImage };
