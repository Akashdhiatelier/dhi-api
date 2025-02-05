const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../config/config");
const OPERATION = require("../repository/operations");
const CustomError = require("../utils/customError");

const db = require("../models");
const { unlinkFile } = require("../utils/common");

const getById = async (tokenUserId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: tokenUserId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id", "first_name", "last_name", "email", "avatar", "avatar_url"],
  };

  const checkUser = await OPERATION.findOne(db.users, query);

  if (!checkUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not exists");
  }

  if (checkUser.id != tokenUserId) {
    throw new CustomError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
  }

  return checkUser;
};

const updateById = async (body, tokenId, req) => {
  const { first_name: firstName, last_name: lastName, email } = body;

  const q = {
    where: { [Op.and]: [{ email: { [Op.eq]: email } }, { id: { [Op.ne]: tokenId } }, { is_deleted: { [Op.eq]: false } }] },
  };
  const checkDuplicate = await OPERATION.findOne(db.users, q);
  if (checkDuplicate) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Email already exists");
  }

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: tokenId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const checkUser = await OPERATION.findOne(db.users, query);
  if (!checkUser) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "User not exists");
  }
  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkUser.avatar_url;
  }

  const paramsToUpdate = {
    first_name: firstName,
    last_name: lastName,
    email,
    avatar: req.file ? req.file.filename : checkUser.dataValues.avatar,
    avatar_url: req.file ? `public/uploads/${req.file.filename}` : checkUser.dataValues.avatar_url,
    update_by: tokenId,
  };

  const updateProfile = await OPERATION.updateById(db.users, tokenId, paramsToUpdate);
  if (!updateProfile) {
    if (req.file) {
      unlinkFile(req);
    }
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

    fs.access(`public/uploads/${fileToDelete}`, fs.constants.F_OK, (err) => {
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

  const token = req.headers.authorization.split(" ")[1];

  const find = {
    where: {
      token: { [Op.eq]: token },
    },
  };
  const findToken = await OPERATION.findOne(db.tokens, find);

  const deleteRecord = await OPERATION.deleteById(db.tokens, findToken.id);

  const newToken = jwt.sign({ userId: checkUser.id, role_id: checkUser.role_id, email }, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });

  const data = {
    user_id: checkUser.id,
    type: "Auth",
    token: newToken,
  };

  const updateToken = await OPERATION.create(db.tokens, data);

  return updateToken;
};

const setPassword = async (body, tokenId, req) => {
  const { current_password: currentPassword, password } = body;

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: tokenId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkUser = await OPERATION.findOne(db.users, query);
  if (!checkUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not exists");
  }

  const passwordIsValid = bcrypt.compareSync(currentPassword, checkUser.password);

  if (!passwordIsValid) {
    throw new CustomError(StatusCodes.NOT_FOUND, "current password is not valid");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const paramsToUpdate = {
    password: hashedPassword,
    updated_by: tokenId,
  };

  const updateProfile = await OPERATION.updateById(db.users, tokenId, paramsToUpdate);
  if (!updateProfile) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  return updateProfile;
};

const deleteProfile = async (userId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: userId } }, { role_id: { [Op.ne]: 1 } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkUser = await OPERATION.findOne(db.users, query);
  if (!checkUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not exixts!");
  }

  const dataToUpdate = {
    avatar: "",
    avatar_url: "",
    is_deleted: true,
    deleted_by: userId,
    deleted_at: new Date(),
  };

  const updateUser = await OPERATION.updateById(db.users, checkUser.id, dataToUpdate);
  if (!updateUser) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  fs.access(`public/uploads/${checkUser.avatar}`, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/uploads/${checkUser.avatar}`, (error) => {
        if (error) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
      });
    }
  });
  fs.access(`public/uploads/${checkUser.avatar}`, fs.constants.F_OK, (errr) => {
    if (errr) {
      console.log(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/thumbnails/${checkUser.avatar}`, (err) => {
        if (err) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
      });
    }
  });

  return true;
};

module.exports = {
  getById,
  updateById,
  setPassword,
  deleteProfile,
};
