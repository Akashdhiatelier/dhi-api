const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");

const add = async (body) => {
  const { name, slug } = body;
  const query = {
    where: {
      [Op.or]: [
        {
          name: {
            [Op.eq]: name,
          },
        },
        {
          slug: {
            [Op.eq]: slug,
          },
        },
      ],
    },
  };
  const checkModule = await OPERATIONS.findOne(db.modules, query);
  if (checkModule) {
    throw new CustomError(StatusCodes.CONFLICT, "Module already exists!");
  }
  const createModule = await OPERATIONS.create(db.modules, body);
  if (!createModule) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Failed to create new module");
  }
  return createModule;
};

const getAll = async () => {
  const query = {
    where: {
      is_deleted: {
        [Op.eq]: false,
      },
    },
    attributes: ["id", "name", "slug"],
  };
  const getAllModules = await OPERATIONS.findAll(db.modules, query);
  if (!getAllModules) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Problem occured in get modules");
  }
  return getAllModules;
};

const getByIdController = async (id) => {
  const query = {
    where: {
      [Op.and]: [
        {
          id: { [Op.eq]: id },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },

    attributes: ["id", "name", "slug", "status"],
  };
  const findModule = await OPERATIONS.findOne(db.modules, query);
  if (!findModule) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Cannot get this module");
  }

  return findModule;
};

const update = async (body, id) => {
  const { name, slug, status } = body;
  if (!id) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "'id' is required");
  }

  const checkModule = await OPERATIONS.findById(db.modules, id);

  if (!checkModule) {
    throw new CustomError(StatusCodes.NOT_FOUND, `No module found wit id ${id}`);
  }

  const paramsToUpdate = {};
  if (name) paramsToUpdate.name = name;
  if (slug) paramsToUpdate.slug = slug;
  if (status) paramsToUpdate.status = status;

  const updateModule = await OPERATIONS.updateById(db.modules, id, paramsToUpdate);

  if (!updateModule) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured while updating module");
  }
  return updateModule;
};

const deleteOne = async (id) => {
  const checkModule = await OPERATIONS.findById(db.modules, id);

  if (!checkModule) {
    throw new CustomError(StatusCodes.NOT_FOUND, `No module found wit id ${id}`);
  }
  if (checkModule.is_deleted) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Module is already deleted");
  }
  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
  };

  const updateDelete = await OPERATIONS.updateById(db.modules, id, paramsToUpdate);

  if (!updateDelete) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured while deleting module");
  }
  return updateDelete;
};

module.exports = { add, getAll, getByIdController, update, deleteOne };
