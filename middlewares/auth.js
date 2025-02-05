const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");

const OPERATIONS = require("../repository/operations");
const config = require("../config/config");

const db = require("../models");
const CustomError = require("../utils/customError");
const catchAsync = require("../utils/catchAsync");

const authMiddleware = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const { userId, role_id, email } = decoded;
    const query = {
      where: {
        [Op.and]: [
          {
            id: {
              [Op.eq]: userId,
            },
          },
          {
            email: {
              [Op.eq]: email,
            },
          },
          {
            is_deleted: {
              [Op.eq]: false,
            },
          },
        ],
      },
      attributes: ["id", "email", "is_deleted"],
    };

    const checkUser = await OPERATIONS.findOne(db.users, query);

    if (!checkUser) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "Invalid token");
    }

    if (!userId || !role_id || !email) {
      throw new CustomError(StatusCodes.FORBIDDEN, "forbidden");
    }

    const tokenQuery = {
      where: {
        [Op.and]: [
          {
            user_id: {
              [Op.eq]: checkUser.id,
            },
          },
          { type: { [Op.eq]: "Auth" } },
          { token: { [Op.eq]: token } },
        ],
      },
    };

    const checkToken = await OPERATIONS.findOne(db.tokens, tokenQuery);
    if (!checkToken) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    req.userId = userId;
    req.roleId = role_id;
    req.email = email;
    next();
  } catch (error) {
    const find = {
      where: {
        token: { [Op.eq]: token },
      },
    };
    const findToken = await OPERATIONS.findOne(db.tokens, find);
    if (!findToken) {
      throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }
    const deleteRecord = await OPERATIONS.deleteById(db.tokens, findToken.id);
    if (!deleteRecord) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Token expired!");
  }
});

module.exports = authMiddleware;
