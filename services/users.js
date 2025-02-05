const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const fs = require("fs");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");

const db = require("../models");
const { getPaginatedData } = require("../utils/common");

const getAllUsers = async (body, req) => {
  const { _page: offset, _limit: limit, _sort, _order, role, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [
        { is_deleted: { [Op.eq]: false } },
        { id: { [Op.ne]: req.userId } },
        { role_id: { [Op.ne]: 1 } },
        status === "All" ? {} : { status: { [Op.eq]: status } },
      ],
      [Op.or]: [
        { first_name: { [Op.like]: `%${searchTerm}%` } },
        { last_name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    include: [
      {
        model: db.roles,
        where: {
          [Op.and]: [
            role === "All" ? {} : { id: { [Op.eq]: role } },
            { is_deleted: { [Op.eq]: false } },
            { id: { [Op.ne]: 1 } },
          ],
        },
        attributes: ["name"],
      },
    ],
    attributes: ["id", "first_name", "last_name", "email", "avatar", "avatar_url", "status"],
  };

  const getPanigated = await getPaginatedData(db.users, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Problem occured!");
  }
  return getPanigated;
};

const updateById = async (body, id, req) => {
  if (!id) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Id is required");
  }
  const { userId } = req;

  if (id == userId) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Cannot update this user");
  }
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
        {
          role_id: {
            [Op.ne]: 1,
          },
        },
      ],
    },
  };
  const findUser = await OPERATIONS.findOne(db.users, query);

  if (!findUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Cannot update this User");
  }
  let fileToDelete = "";
  if (req.file) {
    fileToDelete = findUser.avatar;
  }

  const paramsToUpdate = {
    role_id: body.role,
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    avatar: req.file ? req.file.filename : findUser.dataValues.avatar,
    avatar_url: req.file ? `public/thumbnails/${req.file.filename}` : findUser.dataValues.avatar_url,
    status: body.status,
    updated_by: userId,
  };

  const updateUser = await OPERATIONS.updateById(db.users, id, paramsToUpdate);
  if (!updateUser) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  if (fileToDelete) {
    fs.access(`public/uploads/${fileToDelete}`, fs.constants.F_OK, (err) => {
      if (err) {
        console.log(`File does not exist.`);
      } else {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlink(`public/uploads/${fileToDelete}`, (error) => {
          if (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
          }
        });
      }
    });

    fs.access(`public/thumbnails/${fileToDelete}`, fs.constants.F_OK, (err) => {
      if (err) {
        console.log(`File does not exist.`);
      } else {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlink(`public/thumbnails/${fileToDelete}`, (errr) => {
          if (errr) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
          }
        });
      }
    });
  }

  req.file = {};

  return updateUser;
};

const updatePublicUser = async (body, req) => {
  try {
    const { userId } = req;

    const query = {
      where: {
        [Op.and]: [
          {
            id: { [Op.eq]: userId },
          },
          {
            is_deleted: {
              [Op.eq]: false,
            },
          },
          {
            role_id: {
              [Op.ne]: 1,
            },
          },
        ],
      },
    };
    const findUser = await OPERATIONS.findOne(db.users, query);

    if (!findUser) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Cannot update this User");
    }
    let fileToDelete = "";
    if (req.file) {
      fileToDelete = findUser.avatar;
    }

    const paramsToUpdate = {
      role_id: body.role,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      avatar: req.file ? req.file.filename : findUser.dataValues.avatar,
      avatar_url: req.file ? `public/thumbnails/${req.file.filename}` : findUser.dataValues.avatar_url,
      status: body.status,
      updated_by: userId,
    };

    const updateUser = await OPERATIONS.updateById(db.users, userId, paramsToUpdate);
    if (!updateUser) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
    }

    if (fileToDelete) {
      fs.access(`public/uploads/${fileToDelete}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File does not exist.`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.unlink(`public/uploads/${fileToDelete}`, (error) => {
            if (error) {
              throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
            }
          });
        }
      });

      fs.access(`public/thumbnails/${fileToDelete}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File does not exist.`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.unlink(`public/thumbnails/${fileToDelete}`, (errr) => {
            if (errr) {
              throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
            }
          });
        }
      });
    }

    req.file = {};

    return updateUser;
  } catch (error) {
    console.log("🚀 ~ updatePublicUser ~ error:", error);
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const getById = async (id, userId, roleId) => {
  if (userId !== 1 && userId != id) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Cannot get this User");
  }
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
        roleId === 1
          ? {}
          : {
              role_id: {
                [Op.ne]: 1,
              },
            },
      ],
    },
    include: [
      {
        model: db.roles,
        where: {
          [Op.and]: [{ is_deleted: { [Op.eq]: false } }, roleId === 1 ? {} : { id: { [Op.ne]: 1 } }],
        },
        attributes: ["name"],
      },
    ],
    attributes: ["id", "role_id", "first_name", "last_name", "email", "avatar_url", "avatar", "status"],
  };
  const findUser = await OPERATIONS.findOne(db.users, query);
  if (!findUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Cannot get this User");
  }

  return findUser;
};

const multiUpdate = async (body, userId, roleId) => {
  const { user_ids: userIds, status } = body;

  const moduleQuery = {
    where: { role_id: { [Op.ne]: 1 } },
    attributes: ["id"],
  };
  const getUsers = await OPERATIONS.findAll(db.users, moduleQuery);
  const getUserIds = getUsers.map((i) => i.id);
  const checkSuperUser = getUsers.find((i) => i.role_id === 1);
  if (checkSuperUser) {
    throw new CustomError(StatusCodes.FORBIDDEN, "Cannot update this role");
  }
  const invalidIds = userIds.filter((id) => !getUserIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `User Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.users.update(dataToUpdate, { where: { id: { [Op.in]: userIds } } }, { transaction: t });
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating users";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating users");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while updating users");
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { user_ids: userIds } = body;

  const moduleQuery = {
    where: { role_id: { [Op.ne]: 1 } },
    attributes: ["id"],
  };
  const getUsers = await OPERATIONS.findAll(db.users, moduleQuery);
  const getUserIds = getUsers.map((i) => i.id);
  const checkSuperUser = getUsers.find((i) => i.role_id === 1);
  if (checkSuperUser) {
    throw new CustomError(StatusCodes.FORBIDDEN, "Cannot delete this role");
  }
  const invalidIds = userIds.filter((id) => !getUserIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `User Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.users.update(dataToUpdate, { where: { id: { [Op.in]: userIds } } }, { transaction: t });
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting users";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting users");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while deleting users");
  }
  return true;
};

const deleteById = async (id, req) => {
  const { userId } = req;

  if (id == userId) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Cannot delete this user");
  }

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
        {
          role_id: {
            [Op.ne]: 1,
          },
        },
      ],
    },
  };
  const findUser = await OPERATIONS.findOne(db.users, query);
  if (!findUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Cannot delete this User");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const updateUser = await OPERATIONS.updateById(db.users, id, paramsToUpdate);
  if (!updateUser) {
    throw new CustomError(StatusCodes.INSUFFICIENT_STORAGE, "Problem occured");
  }

  return updateUser;
};

module.exports = { getAllUsers, updateById, updatePublicUser, getById, multiUpdate, multiDelete, deleteById };
