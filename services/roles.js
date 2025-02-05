const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");
const { getPaginatedData, slugifyString } = require("../utils/common");

const add = async (body) => {
  const { name } = body;
  const slug = slugifyString(name);

  const query = {
    where: {
      slug: {
        [Op.eq]: slug,
      },
    },
  };
  const checkRole = await OPERATIONS.findOne(db.roles, query);
  if (checkRole) {
    throw new CustomError(StatusCodes.CONFLICT, "Role already exists!");
  }
  const createRole = await OPERATIONS.create(db.roles, body);
  if (!createRole) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Failed to create new role");
  }
  return createRole;
};

const getAll = async (body, userId, roleId) => {
  const { _page: offset, _limit: limit, _sort, _order, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [
        {
          name: {
            [Op.ne]: "Superadmin",
          },
        },
        { is_deleted: { [Op.eq]: false } },
        { id: { [Op.ne]: roleId } },
        status === "All" ? {} : { status: { [Op.eq]: status } },
      ],
      [Op.or]: [{ name: { [Op.like]: `%${searchTerm}%` } }],
    },
    order: [[_sort, _order.toUpperCase()]],
    attributes: ["id", "name", "status"],
  };

  const getPanigated = await getPaginatedData(db.roles, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};

const update = async (body, id) => {
  const { name, status } = body;
  if (!id) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "'id' is required");
  }

  const checkRole = await OPERATIONS.findById(db.roles, id);

  if (!checkRole) {
    throw new CustomError(StatusCodes.NOT_FOUND, `No role found wit id ${id}`);
  }

  const slug = slugifyString(name);

  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.roles, q);
  if (checkDuplicate) {
    throw new CustomError(StatusCodes.CONFLICT, "Role already exists");
  }

  const paramsToUpdate = {};
  if (name) paramsToUpdate.name = name;
  if (status) paramsToUpdate.status = status;
  paramsToUpdate.slug = slug;

  if (id == 1) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Cannot update this user");
  }

  const updateRole = await OPERATIONS.updateById(db.roles, id, paramsToUpdate);

  if (!updateRole) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured while updating role");
  }
  return updateRole;
};

const deleteOne = async (id) => {
  const checkRole = await OPERATIONS.findById(db.roles, id);

  if (!checkRole) {
    throw new CustomError(StatusCodes.NOT_FOUND, `No role found wit id ${id}`);
  }
  if (checkRole.is_deleted) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Role is already deleted");
  }
  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
  };
  if (id == 1) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Cannot delete this user");
  }

  const updateDelete = await OPERATIONS.updateById(db.roles, id, paramsToUpdate);

  if (!updateDelete) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured while deleting role");
  }
  return updateDelete;
};

const multiUpdate = async (body, userId, roleId) => {
  const { role_ids: roleIds, status } = body;

  const roleQuery = {
    where: {
      [Op.and]: [
        { id: { [Op.ne]: 1 } },
        {
          id: { [Op.ne]: roleId },
        },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
    attributes: ["id"],
  };
  const getRoles = await OPERATIONS.findAll(db.roles, roleQuery);
  const getRoleIds = getRoles.map((i) => i.id);
  const invalidIds = roleIds.filter((id) => !getRoleIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Role Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.roles.update(dataToUpdate, { where: { id: { [Op.in]: roleIds } } }, { transaction: t });
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating roles";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating roles");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while updating roles");
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { role_ids: roleIds } = body;

  const roleQuery = {
    where: {
      [Op.and]: [
        { id: { [Op.ne]: 1 } },
        {
          id: { [Op.ne]: roleId },
        },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
    attributes: ["id"],
  };

  const getRoles = await OPERATIONS.findAll(db.roles, roleQuery);
  const getRoleIds = getRoles.map((i) => i.id);
  const invalidIds = roleIds.filter((id) => !getRoleIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Role Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.roles.update(dataToUpdate, { where: { id: { [Op.in]: roleIds } } }, { transaction: t });
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting roles";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting roles");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while deleting roles");
  }
  return true;
};

module.exports = { add, getAll, update, deleteOne, multiUpdate, multiDelete };
