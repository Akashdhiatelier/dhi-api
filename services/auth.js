const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");
const config = require("../config/config");
const { sendVerificationEmail, sendForgotPasswordEmail } = require("../helpers/email/sendVerificationMail");
const { generateRandomString, unlinkFile } = require("../utils/common");

const db = require("../models");

const login = async (body, fingerprint) => {
  const { email, password } = body;
  const query = {
    where: {
      [Op.and]: [{ email: { [Op.eq]: email } }, { is_deleted: { [Op.eq]: false } }],
    },
    include: [
      {
        model: db.roles,
        where: {
          is_deleted: false,
        },
        attributes: ["id", "name"],
      },
    ],
  };
  const checkUser = await OPERATIONS.findOne(db.users, query);

  if (!checkUser) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!checkUser.is_verified) {
    throw new CustomError(
      StatusCodes.NOT_FOUND,
      `Please verify user ${checkUser.first_name} ${checkUser.last_name} in your mail`
    );
  }

  if (checkUser.status === "Inactive" || checkUser.status === "Draft") {
    throw new CustomError(StatusCodes.NOT_FOUND, "Inactive user");
  }

  const passwordIsValid = bcrypt.compareSync(password, checkUser.password);

  if (!passwordIsValid) {
    throw new CustomError(StatusCodes.NOT_FOUND, "password is not valid");
  }

  if (fingerprint.hash !== checkUser.fingerprint) {
    // send mail
  }

  const permissionQuery = {
    where: {
      [Op.and]: [
        {
          role_id: {
            [Op.eq]: checkUser.role_id,
          },
        },
        {
          is_deleted: false,
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
    attributes: ["read", "write", "update", "delete"],
  };

  let permissions = await OPERATIONS.findAll(db.role_permissions, permissionQuery);

  if (!permissions) {
    permissions = [];
  }

  const token = jwt.sign({ userId: checkUser.id, role_id: checkUser.role_id, email: checkUser.email }, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });

  if (!token) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem with token generation");
  }

  const refinedPermission = permissions.reduce((p, c) => {
    p.push({
      name: c.module.name,
      read: c.dataValues.read,
      write: c.dataValues.write,
      update: c.dataValues.update,
      delete: c.dataValues.delete,
    });
    return p;
  }, []);

  const loginJson = {
    first_name: checkUser.first_name,
    last_name: checkUser.last_name,
    email: checkUser.email,
    token,
    status: checkUser.status,
    role: checkUser.role.name,
    avatar_url: checkUser.avatar_url,
    permissions: refinedPermission,
  };

  const data = {
    user_id: checkUser.id,
    type: "Auth",
    token,
  };

  const updateToken = await OPERATIONS.create(db.tokens, data);
  if (!updateToken) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return loginJson;
};

const register = async (body, fingerprint, origin, userId, req) => {
  const { email, role } = body;
  const query = {
    where: {
      [Op.and]: [
        {
          email: {
            [Op.eq]: email,
          },
        },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
    attributes: ["email"],
  };
  const checkRegisteredUser = await OPERATIONS.findOne(db.users, query);
  if (checkRegisteredUser) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.CONFLICT, "Email already exists");
    // if (!checkRegisteredUser.is_verified) {
    //   const tokenQuery = {
    //     where: {
    //       user_id: {
    //         [Op.eq]: checkRegisteredUser.id,
    //       },
    //     },
    //   };
    //   const getToken = await OPERATIONS.findOne(db.tokens, tokenQuery);
    //   if (!getToken) {
    //     if (req.file) {
    //       unlinkFile(req);
    //     }
    //     throw new CustomError(StatusCodes.NOT_FOUND, "Cannot find token");
    //   }
    //   await sendVerificationEmail(checkRegisteredUser, origin, getToken);
    //   if (req.file) {
    //     unlinkFile(req);
    //   }
    //   throw new CustomError(StatusCodes.BAD_REQUEST, "Please verify user in your email address");
    // }
    // if (req.file) {
    //   unlinkFile(req);
    // }
    // throw new CustomError(StatusCodes.CONFLICT, "User already registered");
  }

  const checkRole = await OPERATIONS.findById(db.roles, role);

  if (!checkRole) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Please use valid role");
  }

  let newUser = {};
  if (fingerprint) {
    newUser = {
      ...body,
      fingerprint: fingerprint.hash,
    };
  } else {
    newUser = { ...body };
  }

  newUser = {
    ...newUser,
    role_id: role,
    avatar: req.file ? req.file.filename : "",
    avatar_url: req.file ? `public/uploads/${req.file.filename}` : "",
    password: generateRandomString(),
    created_by: userId || null,
  };

  const createNewUser = await OPERATIONS.create(db.users, newUser);

  if (!createNewUser) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.BAD_REQUEST, "Failed to register new user");
  }

  const tokenData = {
    user_id: createNewUser.id,
    type: "Verify",
    token: generateRandomString(),
  };

  const createToken = await OPERATIONS.create(db.tokens, tokenData);
  if (!createToken) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.BAD_REQUEST, "Failed to create new token");
  }

  await sendVerificationEmail(createNewUser, origin, createToken);

  return createNewUser;
};

const verify = async (body) => {
  const { token } = body;
  const query = {
    where: {
      token: {
        [Op.eq]: token,
      },
    },
  };
  const checkToken = await OPERATIONS.findOne(db.tokens, query);
  if (!checkToken) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Token expired or use valid token");
  }

  if (checkToken.type === "Reset") {
    return true;
  }

  const checkUser = await OPERATIONS.findById(db.users, checkToken.user_id);

  if (!checkUser || checkUser.is_deleted) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (checkUser.is_verified) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User already verified");
  }
  const paramsToUpdate = {};
  paramsToUpdate.is_verified = true;
  paramsToUpdate.verified_at = new Date();

  const updateUser = await OPERATIONS.updateById(db.users, checkUser.id, paramsToUpdate);

  if (!updateUser) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured!");
  }

  const updateToken = await OPERATIONS.updateById(db.tokens, checkToken.id, {
    type: "Reset",
  });

  if (!updateToken) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured!");
  }

  return true;
};

const passwordUpdate = async (body, token) => {
  if (!token) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Token is required");
  }

  const { password } = body;

  const query = {
    where: {
      [Op.and]: [
        {
          token: {
            [Op.eq]: token,
          },
        },
        {
          type: "Reset",
        },
      ],
    },
  };
  const checkToken = await OPERATIONS.findOne(db.tokens, query);
  if (!checkToken) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Token expired or use valid token");
  }
  const checkUser = await OPERATIONS.findById(db.users, checkToken.user_id);

  if (!checkUser || checkUser.is_deleted) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!checkUser.is_verified) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Please verify user in your email");
  }

  if (checkUser.password && checkUser.password === password) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Please use different password");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const paramsToUpdate = {};
  paramsToUpdate.password = hashedPassword;

  const updateUser = await OPERATIONS.updateById(db.users, checkUser.id, paramsToUpdate);

  if (!updateUser) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured!");
  }

  const deleteToken = await OPERATIONS.deleteById(db.tokens, checkToken.id);

  if (!deleteToken) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Problem occured!");
  }

  return deleteToken;
};

const forgetPassword = async (body, origin) => {
  const { email } = body;
  const query = {
    where: {
      [Op.and]: [{ email: { [Op.eq]: email } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const checkUser = await OPERATIONS.findOne(db.users, query);
  if (!checkUser || checkUser.is_deleted) {
    throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (checkUser && !checkUser.is_verified) {
    const tokenQuery = {
      where: {
        user_id: {
          [Op.eq]: checkUser.id,
        },
      },
    };
    const getToken = await OPERATIONS.findOne(db.tokens, tokenQuery);
    if (!getToken) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Cannot find token");
    }
    await sendVerificationEmail(checkUser, origin, getToken);
    throw new CustomError(StatusCodes.BAD_REQUEST, "Please verify user in your email address");
  }

  const tokenData = {
    user_id: checkUser.id,
    type: "Reset",
    token: generateRandomString(),
  };

  const createToken = await OPERATIONS.create(db.tokens, tokenData);
  if (!createToken) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Failed to create new token");
  }

  await sendForgotPasswordEmail(checkUser, origin, createToken);

  return true;
};

module.exports = { login, register, verify, passwordUpdate, forgetPassword };
