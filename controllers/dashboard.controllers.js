const { StatusCodes } = require("http-status-codes");

const catchAsync = require("../utils/catchAsync");
const dashboardService = require("../services/dashboard");
const { setSuccessResponse } = require("../utils/sendResponse");

const getStaticsticsController = catchAsync(async (req, res) => {
  const getStaticstics = await dashboardService.getStaticstics(req.userId);
  if (getStaticstics) {
    return setSuccessResponse(res, StatusCodes.OK, true, getStaticstics, "");
  }
});

module.exports = { getStaticsticsController };
