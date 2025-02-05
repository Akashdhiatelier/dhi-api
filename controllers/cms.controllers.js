const { StatusCodes } = require("http-status-codes");

const catchAsync = require("../utils/catchAsync");
const cmsSecvice = require("../services/cms");

const { setSuccessResponse } = require("../utils/sendResponse");

const getBySlugController = catchAsync(async (req, res) => {
  const getCMS = await cmsSecvice.getBySlugController(req.params.slug);
  if (getCMS) {
    return setSuccessResponse(res, StatusCodes.OK, true, getCMS, "");
  }
});
const updateBySlugController = catchAsync(async (req, res) => {
  const updateCMS = await cmsSecvice.updateBySlugController(req.params.slug, req.body);
  if (updateCMS) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateCMS, "Content Updated");
  }
});

const getCMSDataController = catchAsync(async (req, res) => {
  const getCMSData = await cmsSecvice.getCMSData(req.params.title);
  if (getCMSData || getCMSData === null) {
    return setSuccessResponse(res, StatusCodes.OK, true, getCMSData || null, getCMSData ? "" : "No Results Found");
  }
});

const addWebCMSController = catchAsync(async (req, res) => {
  const addWebCMS = await cmsSecvice.addWebCMS(req);
  if (addWebCMS) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "Success");
  }
});

const updateWebCMSController = catchAsync(async (req, res) => {
  const updateWebCMS = await cmsSecvice.updateWebCMS(req);
  if (updateWebCMS) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "Success");
  }
});

const deleteWebCMSController = catchAsync(async (req, res) => {
  const deleteWebCMS = await cmsSecvice.deleteWebCMS(req.params.id, req.userId);
  if (deleteWebCMS) {
    return setSuccessResponse(res, StatusCodes.OK, true, null, "Success");
  }
});

module.exports = {
  getBySlugController,
  updateBySlugController,
  getCMSDataController,
  addWebCMSController,
  updateWebCMSController,
  deleteWebCMSController,
};
