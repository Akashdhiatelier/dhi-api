const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const rolePermissionsService = require("../services/role-permissions");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await rolePermissionsService.add(req.body, req.userId);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const updateController = catchAsync(async (req, res) => {
  const updatePermission = await rolePermissionsService.update(req.body, req.params.id, req);
  if (updatePermission) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Permissions updated");
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const getRoleById = await rolePermissionsService.getRoleById(req.params.id, req);
  if (getRoleById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getRoleById, "");
  }
});

module.exports = {
  addController,
  updateController,
  getByIdController,
};
