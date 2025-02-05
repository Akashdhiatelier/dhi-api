const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { checkSequelizeErrors } = require("../utils/common");
const CustomError = require("../utils/customError");

const create = async (ModelName, data, transaction = {}) => {
  try {
    return await ModelName.create(data, transaction);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Unable to create the record");
  }
};

const findAll = async (ModelName, filter = {}) => {
  try {
    return await ModelName.findAll(filter);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Unable to find data");
  }
};

const findById = async (ModelName, id) => {
  try {
    return await ModelName.findByPk(id);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || `Cannot find data with id ${id}`);
  }
};

const findOne = async (ModelName, query = {}) => {
  try {
    return await ModelName.findOne(query);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Cannot find data");
  }
};

const update = async (ModelName, data, filter = {}, transaction = {}) => {
  try {
    return await ModelName.update(data, filter, transaction);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, `Cannot update data`);
  }
};

const updateById = async (ModelName, id, data, transaction = {}) => {
  try {
    return await ModelName.update(data, { where: { id } }, transaction);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || `Cannot update data with id ${id}`, error);
  }
};

const deleteById = async (ModelName, id) => {
  try {
    return await ModelName.destroy({ where: { id } });
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || `Cannot delete data with id ${id}`);
  }
};

const bulkCreate = async (ModelName, data, transaction = {}) => {
  try {
    return await ModelName.bulkCreate(data, transaction);
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Cannot create records");
  }
};

const bulkUpdate = async (ModelName, data, field) => {
  try {
    return await ModelName.update(data, {
      where: { [field]: { [Op.in]: data.map((item) => item[field]) } },
    });
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Unable to update the records");
  }
};

const bulkDelete = async (ModelName, field, ids) => {
  try {
    return await ModelName.destroy({
      where: { [field]: { [Op.in]: ids } },
    });
  } catch (error) {
    console.error(error);
    throw new CustomError(StatusCodes.NOT_FOUND, checkSequelizeErrors(error) || "Unable to delete the records");
  }
};

module.exports = {
  create,
  findAll,
  findById,
  findOne,
  update,
  updateById,
  deleteById,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
};
