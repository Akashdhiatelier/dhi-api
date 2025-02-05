const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");
const { isNumber, getPaginatedData, slugifyString } = require("../utils/common");

const add = async (body, userId) => {
  const slug = slugifyString(body.name);
  const query = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { user_id: { [Op.eq]: userId } }],
    },
  };
  const checkCategory = await OPERATIONS.findOne(db.categories, query);
  if (checkCategory) {
    throw new CustomError(StatusCodes.CONFLICT, "Category already exists");
  }
  const dataToCreate = {
    ...body,
    user_id: userId,
    created_by: userId,
  };
  const addCategory = await OPERATIONS.create(db.categories, dataToCreate);
  if (!addCategory) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return addCategory;
};

const getAll = async (body, userId) => {
  try {
    const { _page: offset, _limit: limit, _sort, _order, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [
        { is_deleted: { [Op.eq]: false } },
        { user_id: { [Op.eq]: userId } },
        status === "All" ? {} : { status: { [Op.eq]: status } },
      ],
      [Op.or]: { name: { [Op.like]: `%${searchTerm}%` } },
    },
    order: [[_sort, _order.toUpperCase()]],
    attributes: ["id", "name", "status"],
  };

  const getPanigated = await getPaginatedData(db.categories, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
  } catch (error) {
    console.log("error===========>",error);
  }
};

const getById = async (id, userId, roleId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: id } }, roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }],
    },
    attributes: ["id", "name", "status"],
  };

  const getUser = await OPERATIONS.findOne(db.categories, query);
  if (!getUser) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  return getUser;
};

const update = async (body, categoryId, userId) => {
  if (!categoryId) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(categoryId)) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [
        {
          id: { [Op.eq]: categoryId },
        },
        { user_id: { [Op.eq]: userId } },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };
  const checkCategory = await OPERATIONS.findOne(db.categories, query);
  if (!checkCategory) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Category does not exists!");
  }

  const slug = slugifyString(body.name);
  const checkQuery = {
    where: {
      [Op.and]: [{ id: { [Op.ne]: categoryId } }, { slug: { [Op.eq]: slug } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.categories, checkQuery);
  if (checkDuplicate) {
    throw new CustomError(StatusCodes.CONFLICT, "Category already exists!");
  }

  const paramsToUpdate = {
    ...body,
    slug,
    updated_by: userId,
  };

  const updateCategory = await OPERATIONS.updateById(db.categories, categoryId, paramsToUpdate);
  if (!updateCategory) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return updateCategory;
};

const deleteCategoryById = async (categoryId, userId) => {
  const query = {
    where: {
      [Op.and]: [
        {
          id: {
            [Op.eq]: categoryId,
          },
        },
        {
          user_id: { [Op.eq]: userId },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };
  const checkCategory = await OPERATIONS.findOne(db.categories, query);
  if (!checkCategory) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Category is not exists!");
  }

  if (checkCategory.is_deleted) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Category already deleted");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const deleteCategory = await OPERATIONS.updateById(db.categories, categoryId, paramsToUpdate);
  if (!deleteCategory) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return deleteCategory;
};

const multiUpdate = async (body, userId, roleId) => {
  const { category_ids: categoryIds, status } = body;

  const categoryQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getCategories = await OPERATIONS.findAll(db.categories, categoryQuery);
  const getCategoryIds = getCategories.map((i) => i.id);
  const invalidIds = categoryIds.filter((id) => !getCategoryIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Category Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.categories.update(
      dataToUpdate,
      { where: { id: { [Op.in]: categoryIds } } },
      { transaction: t }
    );
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating categories";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating categories");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while updating categories");
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { category_ids: categoryIds } = body;

  const categoryQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getCategories = await OPERATIONS.findAll(db.categories, categoryQuery);
  const getCategoryIds = getCategories.map((i) => i.id);
  const invalidIds = categoryIds.filter((id) => !getCategoryIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Category Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.categories.update(
      dataToUpdate,
      { where: { id: { [Op.in]: categoryIds } } },
      { transaction: t }
    );
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting categories";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting categories");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while deleting categories");
  }
  return true;
};

module.exports = { add, getAll, getById, update, deleteCategoryById, multiUpdate, multiDelete };
