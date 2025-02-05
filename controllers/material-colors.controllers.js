const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const materialColorsService = require("../services/material-colors");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await materialColorsService.add(req.body, req.userId);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAllColors = await materialColorsService.getAll(req.userId);
  if (getAllColors) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllColors, "");
  }
});

const updateController = catchAsync(async (req, res) => {
  const updateColor = await materialColorsService.update(req.body, req.params.id, req.userId);
  if (updateColor) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Color updated");
  }
});

const deleteController = catchAsync(async (req, res) => {
  const deleteColor = await materialColorsService.deleteColorById(req.params.id, req.userId);
  if (deleteColor) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Color deleted");
  }
});

module.exports = {
  addController,
  getAllController,
  updateController,
  deleteController,
};
