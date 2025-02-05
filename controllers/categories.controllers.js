const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const categoryService = require("../services/categories");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await categoryService.add(req.body, req.userId);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAllCategories = await categoryService.getAll(req.body, req.userId);
  if (getAllCategories) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllCategories, "");
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const getCategoriesById = await categoryService.getById(req.params.id, req.userId, req.roleId);
  if (getCategoriesById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getCategoriesById, "");
  }
});

const updateController = catchAsync(async (req, res) => {
  const updateCategory = await categoryService.update(req.body, req.params.id, req.userId);
  if (updateCategory) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Category updated");
  }
});

const deleteController = catchAsync(async (req, res) => {
  const deleteCategory = await categoryService.deleteCategoryById(req.params.id, req.userId);
  if (deleteCategory) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Category deleted");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateCategory = await categoryService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateCategory) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateCategory, "Categories Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteCategory = await categoryService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteCategory) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteCategory, "Categories Deleted");
  }
});

module.exports = {
  addController,
  getAllController,
  getByIdController,
  updateController,
  deleteController,
  multiUpdateController,
  multiDeleteController,
};
