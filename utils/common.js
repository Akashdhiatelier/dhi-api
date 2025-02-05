const crypto = require("crypto");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const { default: slugify } = require("slugify");

const catchAsync = require("./catchAsync");
const CustomError = require("./customError");

const generateRandomString = (length = 40) => {
  return crypto.randomBytes(length).toString("hex");
};

const getPaginatedData = async (model, page = 1, pageSize = 10, filter = {}) => {
  if (page === 0) {
    const count = 0;
    const totalPages = 0;
    const currentPage = page;
    const data = [];
    return { count, totalPages, currentPage, data };
  }
  const count = await model.count(filter);
  if (count === 0) {
    const totalPages = 0;
    const currentPage = page;
    const data = [];
    return { count, totalPages, currentPage, data };
  }
  const totalPages = Math.ceil(count / pageSize);
  const currentPage = Number(page);
  const offset = (currentPage - 1) * pageSize;
  const limit = pageSize;
  const query = {
    offset,
    limit,
    ...filter,
  };
  const data = await model.findAll(query);
  return { count, totalPages, currentPage, data };
};

const checkSequelizeErrors = (sequelizeErrors) => {
  let message = "";
  if (sequelizeErrors.name === "SequelizeUniqueConstraintError") {
    message = sequelizeErrors.errors[0].message;
  } else if (sequelizeErrors.name === "SequelizeValidationError") {
    message = sequelizeErrors.errors[0].message;
  } else if (sequelizeErrors.name === "SequelizeDatabaseError") {
    message = sequelizeErrors.parent.sqlMessage;
  }
  return message === "" ? false : message;
};

const isNumber = (value) => {
  if (typeof value === "string") {
    // eslint-disable-next-line no-restricted-globals
    return !isNaN(value);
  }
};

const unlinkFile = catchAsync((req) => {
  fs.access(`public/uploads/${req.file.filename}`, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/uploads/${req.file.filename}`, (error) => {
        if (error) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
        req.file.filename = null;
      });
    }
  });
  fs.access(`public/thumbnails/${req.file.filename}`, fs.constants.F_OK, (errr) => {
    if (errr) {
      console.log(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/thumbnails/${req.file.filename}`, (err) => {
        if (err) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
        req.file.filename = null;
      });
    }
  });
});

const slugifyString = (str) => {
  const slug = slugify(str, {
    replacement: "",
    lower: true,
    trim: true,
  });
  return slug;
};

module.exports = {
  generateRandomString,
  getPaginatedData,
  checkSequelizeErrors,
  isNumber,
  unlinkFile,
  slugifyString,
};
