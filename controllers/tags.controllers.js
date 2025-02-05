const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const tagService = require("../services/tags");
const { setSuccessResponse } = require("../utils/sendResponse");

const getController = catchAsync(async (req, res) => {
  const getAll = await tagService.getAll(req.body);
  if (getAll) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAll, "");
  }
});

module.exports = {
  getController,
};
