const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");

const add = async (body, userId) => {
  const { name, status, permissions } = body;

  const checkRoleQuery = {
    where: {
      [Op.and]: [
        {
          name: {
            [Op.eq]: name,
          },
        },
        {
          is_deleted: { [Op.eq]: false },
        },
      ],
    },
  };

  const checkRole = await OPERATIONS.findOne(db.roles, checkRoleQuery);
  if (checkRole) {
    throw new CustomError(StatusCodes.CONFLICT, "Role already exists!");
  }

  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();

  try {
    const roleConfig = {
      name,
      status,
      created_by: userId,
    };

    const createRole = await OPERATIONS.create(db.roles, roleConfig, { transaction: t1 });
    if (!createRole) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }

    // check module ids
    const ids = permissions.map((i) => i.module_id);
    const moduleQuery = {
      attributes: ["id"],
    };
    const getModules = await OPERATIONS.findAll(db.modules, moduleQuery);
    const getModuleIds = getModules.map((i) => i.id);
    const invalidIds = ids.filter((id) => !getModuleIds.includes(id));
    if (invalidIds.length > 0) {
      throw new CustomError(StatusCodes.NOT_FOUND, `Module Ids ${invalidIds.toString()} are invalid!`);
    }

    await permissions.forEach(async (items) => {
      const data = {
        role_id: createRole.id,
        module_id: items.module_id,
        read: items.read,
        write: items.write,
        update: items.update,
        delete: items.delete,
        status: items.status,
        created_by: userId,
      };
      const createPermission = await OPERATIONS.create(db.role_permissions, data, { transaction: t2 });
      if (!createPermission) {
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
      }
    });

    await t1.commit();
    await t2.commit();
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating permission");
  }
  return true;
};

const getRoleById = async (id, req) => {
  if (id == 1) {
    if (req.roleId !== 1) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Cannot get data for this user");
    }
  }

  const attributes = {
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
    attributes: ["id", "name", "status"],
  };
  const checkRole = await OPERATIONS.findOne(db.roles, attributes);
  if (!checkRole) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Role with id ${id} not found`);
  }

  const query = {
    where: {
      [Op.and]: [
        {
          role_id: {
            [Op.eq]: id,
          },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
    include: [
      {
        model: db.modules,
        where: {
          is_deleted: { [Op.eq]: false },
        },
        attributes: ["name"],
      },
    ],
    attributes: { exclude: ["role_id", "is_deleted", "deleted_at", "createdAt", "updatedAt"] },
  };

  const getAllPermissionsByRole = await OPERATIONS.findAll(db.role_permissions, query);

  if (!getAllPermissionsByRole) {
    throw new CustomError(StatusCodes.INSUFFICIENT_STORAGE, "Problem occured!");
  }

  const role = checkRole.dataValues;
  role.permissoins = getAllPermissionsByRole;

  return role;
};

const update = async (body, roleId, req) => {
  const { name, status, permissions } = body;
  if (!roleId) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Please add role id");
  }

  const checkRoleQuery = {
    where: {
      [Op.and]: [
        {
          name: {
            [Op.eq]: name,
          },
        },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };

  const checkDuplicateRole = await OPERATIONS.findOne(db.roles, checkRoleQuery);
  if (checkDuplicateRole) {
    throw new CustomError(StatusCodes.CONFLICT, "Role already exists!");
  }

  const checkActiveRole = {
    where: {
      [Op.and]: [
        {
          id: { [Op.eq]: roleId },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };
  const checkRole = await OPERATIONS.findOne(db.roles, checkActiveRole);
  if (!checkRole) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Role id ${roleId} is not valid`);
  }

  const query = {
    where: {
      role_id: {
        [Op.eq]: roleId,
      },
    },
  };

  const checkPermissionsByRoleId = await OPERATIONS.findAll(db.role_permissions, query);

  if (!checkPermissionsByRoleId) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Problem occured!");
  }

  // check module ids
  const ids = permissions.map((i) => i.module_id);
  const moduleQuery = {
    attributes: ["id"],
  };
  const getModules = await OPERATIONS.findAll(db.modules, moduleQuery);
  const getModuleIds = getModules.map((i) => i.id);
  const invalidIds = ids.filter((id) => !getModuleIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Module Ids ${invalidIds.toString()} are invalid!`);
  }

  if (roleId === 1 || roleId === "1") {
    if (req.roleId !== 1) {
      throw new CustomError(StatusCodes.FORBIDDEN, "Cannot update this role");
    }
  }

  const t = await db.sequelize.transaction();
  const t1 = await db.sequelize.transaction();

  try {
    const dataToUpdate = {
      name,
      status,
    };
    const updateRole = await OPERATIONS.updateById(db.roles, roleId, dataToUpdate, { transaction: t1 });
    if (!updateRole) {
      throw new CustomError(StatusCodes.INSUFFICIENT_STORAGE, "Problem occured!");
    }
    await permissions.forEach(async (items) => {
      const updateQuery = {
        where: {
          [Op.and]: [{ role_id: { [Op.eq]: Number(roleId) } }, { module_id: { [Op.eq]: items.module_id } }],
        },
      };
      const data = {
        read: items.read,
        write: items.write,
        update: items.update,
        delete: items.delete,
        status: items.status,
      };
      const updatePermission = await OPERATIONS.update(db.role_permissions, data, updateQuery, { transaction: t });
      if (!updatePermission) {
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
      }
    });
    await t.commit();
    await t1.commit();
  } catch (error) {
    await t.rollback();
    await t1.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating permission");
  }
  return true;
};

module.exports = { add, getRoleById, update };
