const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");
const { isNumber, slugifyString } = require("../utils/common");

const add = async (body, userId) => {
  const slug = slugifyString(body.name);

  const query = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const checkColor = await OPERATIONS.findOne(db.material_colors, query);
  if (checkColor) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Color already exists");
  }
  const dataToCreate = {
    ...body,
    user_id: userId,
    created_by: userId,
  };
  const addColor = await OPERATIONS.create(db.material_colors, dataToCreate);
  if (!addColor) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return addColor;
};

const getAll = async (userId) => {
  const query = {
    where: {
      [Op.and]: [
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
        {
          user_id: {
            [Op.eq]: userId,
          },
        },
      ],
    },
    attributes: ["id", "name", "color"],
  };

  const getColors = await OPERATIONS.findAll(db.material_colors, query);
  if (!getColors) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getColors;
};

const update = async (body, colorId, userId) => {
  if (!colorId) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(colorId)) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [
        {
          id: {
            [Op.eq]: colorId,
          },
        },
        { user_id: { [Op.eq]: userId } },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };
  const checkColor = await OPERATIONS.findOne(db.material_colors, query);
  if (!checkColor) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Color is not exists!");
  }

  const slug = slugifyString(body.name);
  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const checkDuplicateColor = await OPERATIONS.findOne(db.material_colors, q);
  if (checkDuplicateColor) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Color already exists");
  }

  const paramsToUpdate = {
    ...body,
    slug,
    updated_by: userId,
  };

  const updateColor = await OPERATIONS.updateById(db.material_colors, colorId, paramsToUpdate);
  if (!updateColor) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return updateColor;
};

const deleteColorById = async (colorId, userId) => {
  const query = {
    where: {
      [Op.and]: [
        {
          id: {
            [Op.eq]: colorId,
          },
        },
        { user_id: { [Op.eq]: userId } },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };
  const checkColor = await OPERATIONS.findOne(db.material_colors, query);
  if (!checkColor) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Color is not exists!");
  }

  if (checkColor.is_deleted) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Color already deleted");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const deleteColor = await OPERATIONS.updateById(db.material_colors, colorId, paramsToUpdate);
  if (!deleteColor) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return deleteColor;
};

module.exports = { add, getAll, update, deleteColorById };
