const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const roleService = require("../services/roles");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await roleService.add(req.body);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAll = await roleService.getAll(req.body, req.userId, req.roleId);
  if (getAll) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAll, "");
  }
});

const updateByIdController = catchAsync(async (req, res) => {
  const update = await roleService.update(req.body, req.params.id, req);
  if (update) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, null, "Role updated");
  }
});

const deleteByIdController = catchAsync(async (req, res) => {
  const deleteOne = await roleService.deleteOne(req.body.id);
  if (deleteOne) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, null, "Role deleted");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateRoles = await roleService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateRoles) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateRoles, "Roles Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteRoles = await roleService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteRoles) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteRoles, "Roles Deleted");
  }
});

module.exports = {
  addController,
  getAllController,
  updateByIdController,
  deleteByIdController,
  multiUpdateController,
  multiDeleteController,
};
