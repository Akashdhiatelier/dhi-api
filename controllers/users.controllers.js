const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const userService = require("../services/users");
const { setSuccessResponse } = require("../utils/sendResponse");

const getAllUsersController = catchAsync(async (req, res) => {
  const getAllUsers = await userService.getAllUsers(req.body, req);
  if (getAllUsers) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllUsers, "");
  }
});

const updateByIdController = catchAsync(async (req, res) => {
  const updateById = await userService.updateById(req.body, req.params.id, req);
  if (updateById) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "User Updated");
  }
});

const updatePublicUserController = catchAsync(async (req, res) => {
  const updatePublicUser = await userService.updatePublicUser(req.body, req);
  if (updatePublicUser) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "User Updated");
  }
});

const getUserByIdController = catchAsync(async (req, res) => {
  const getUserById = await userService.getById(req.params.id, req.userId, req.roleId);
  if (getUserById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getUserById, "");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateUser = await userService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateUser) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateUser, "Users Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteUser = await userService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteUser) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteUser, "Users Deleted");
  }
});

const deleteByIdController = catchAsync(async (req, res) => {
  const deleteById = await userService.deleteById(req.params.id, req);
  if (deleteById) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "User Deleted");
  }
});

module.exports = {
  getAllUsersController,
  updateByIdController,
  updatePublicUserController,
  getUserByIdController,
  multiUpdateController,
  multiDeleteController,
  deleteByIdController,
};
