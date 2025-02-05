const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");

const profileService = require("../services/profile");
const { setSuccessResponse } = require("../utils/sendResponse");

const getByIdController = catchAsync(async (req, res) => {
  const getProfile = await profileService.getById(req.userId);
  if (getProfile) {
    return setSuccessResponse(res, StatusCodes.OK, true, getProfile, "");
  }
});

const updateByIdController = catchAsync(async (req, res) => {
  const updateProfile = await profileService.updateById(req.body, req.userId, req);
  if (updateProfile) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateProfile.token, "Profile updated");
  }
});

const setPasswordController = catchAsync(async (req, res) => {
  const updatePassword = await profileService.setPassword(req.body, req.userId, req);
  if (updatePassword) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Password updated");
  }
});

const deleteProfileController = catchAsync(async (req, res) => {
  const deleteProfile = await profileService.deleteProfile(req.userId);
  if (deleteProfile) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Profile Deleted");
  }
});

module.exports = {
  getByIdController,
  updateByIdController,
  setPasswordController,
  deleteProfileController,
};
