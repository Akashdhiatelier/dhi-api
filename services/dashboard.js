const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const OPERATIONS = require("../repository/operations");
const db = require("../models");
const CustomError = require("../utils/customError");

const getStaticstics = async (userId) => {
  const usersQuery = {
    where: {
      [Op.and]: [{ role_id: { [Op.ne]: 1 } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getUsers = await OPERATIONS.findAll(db.users, usersQuery);

  if (!getUsers) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const activeUsersQuery = {
    where: {
      [Op.and]: [{ role_id: { [Op.ne]: 1 } }, { status: { [Op.eq]: "Active" } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getActiveUsers = await OPERATIONS.findAll(db.users, activeUsersQuery);

  if (!getActiveUsers) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const categoryQuery = {
    where: {
      [Op.and]: [{ is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
    attributes: ["id"],
  };

  const getCategory = await OPERATIONS.findAll(db.categories, categoryQuery);

  if (!getCategory) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const materialQuery = {
    where: {
      [Op.and]: [{ is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
    attributes: ["id"],
  };

  const getMaterial = await OPERATIONS.findAll(db.materials, materialQuery);

  if (!getMaterial) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const modelQuery = {
    where: {
      [Op.and]: [{ is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
    attributes: ["id"],
  };

  const getModels = await OPERATIONS.findAll(db.models, modelQuery);

  if (!getModels) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const staticstics = {
    totalUsers: getUsers.length,
    activeUsers: getActiveUsers.length,
    categories: getCategory.length,
    materials: getMaterial.length,
    models: getModels.length,
    projects: 0,
  };
  return staticstics;
};

module.exports = { getStaticstics };
