const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { setSuccessResponse } = require("../utils/sendResponse");

const projectBookmarkService = require("../services/project-bookmarks");

const getAllBookmarksByProjectIdController = catchAsync(async (req, res) => {
  const getAllProjectBookmarks = await projectBookmarkService.getAllProjectBookmarks(req.params.id);
  if (getAllProjectBookmarks) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllProjectBookmarks, "");
  }
});

module.exports = {
  getAllBookmarksByProjectIdController,
};
