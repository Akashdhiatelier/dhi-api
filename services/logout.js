const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const OPERATIONS = require("../repository/operations");
const catchAsync = require("../utils/catchAsync");
const CustomError = require("../utils/customError");
const { setSuccessResponse } = require("../utils/sendResponse");

const db = require("../models");

const logout = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const query = {
    where: {
      token: {
        [Op.eq]: token,
      },
    },
  };
  const checkToken = await OPERATIONS.findOne(db.tokens, query);
  if (!checkToken) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const destroyToken = await OPERATIONS.deleteById(db.tokens, checkToken.id);
  if (!destroyToken) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
  }

  return setSuccessResponse(res, StatusCodes.OK, true, [], "");
});

module.exports = { logout };
