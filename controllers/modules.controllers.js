const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const moduleService = require("../services/modules");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await moduleService.add(req.body);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAll = await moduleService.getAll(req);
  if (getAll) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAll, "");
  }
});

const getModuleByIdController = catchAsync(async (req, res) => {
  const getByIdController = await moduleService.getByIdController(req.params.id, req.userId, req.roleId);
  if (getByIdController) {
    return setSuccessResponse(res, StatusCodes.OK, true, getByIdController, "");
  }
});

const updateByIdController = catchAsync(async (req, res) => {
  const update = await moduleService.update(req.body, req.params.id);
  if (update) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, null, "Module updated");
  }
});

const deleteByIdController = catchAsync(async (req, res) => {
  const deleteOne = await moduleService.deleteOne(req.body.id);
  if (deleteOne) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, null, "Module deleted");
  }
});

module.exports = {
  addController,
  getAllController,
  getModuleByIdController,
  updateByIdController,
  deleteByIdController,
};
