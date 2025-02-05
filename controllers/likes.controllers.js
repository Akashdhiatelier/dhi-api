const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { setSuccessResponse } = require("../utils/sendResponse");

const likeService = require("../services/likes");

const getAllLikesByProjectIdController = catchAsync(async (req, res) => {
  const getAllProjectLikes = await likeService.getAllProjectLikes(req.params.id);
  if (getAllProjectLikes) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllProjectLikes, "");
  }
});

const getAllLikesByModelIdController = catchAsync(async (req, res) => {
  const getAllModelLikes = await likeService.getAllModelLikes(req.params.id);
  if (getAllModelLikes) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllModelLikes, "");
  }
});

module.exports = {
  getAllLikesByProjectIdController,
  getAllLikesByModelIdController,
};
