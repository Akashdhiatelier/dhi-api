const { StatusCodes } = require("http-status-codes");

const modelsService = require("../services/models");
const catchAsync = require("../utils/catchAsync");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addModel = await modelsService.addModel(req.body, req.userId, res);
  if (addModel) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addModel, "");
  }
});

const updateController = catchAsync(async (req, res) => {
  const updateModel = await modelsService.updateModel(req.body, req.params.id, req.userId, req);
  if (updateModel) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateModel, "Model Updated");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAllModels = await modelsService.getAllModels(req.body, req.userId, req.roleId);
  if (getAllModels) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllModels, "");
  }
});

const getAllModelsPublicController = catchAsync(async (req, res) => {
  const getAllModels = await modelsService.getAllPublicModels(req.body);
  if (getAllModels) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllModels, "");
  }
});

const getAllWithSearchController = catchAsync(async (req, res) => {
  const getAllWithSearch = await modelsService.getAllWithSearch(req.query, req.userId, req.roleId);
  if (getAllWithSearch) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllWithSearch, "");
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const getModelById = await modelsService.getById(req.params.id, req.userId, req.roleId);
  if (getModelById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getModelById, "");
  }
});
const getByIdModelPublicController = catchAsync(async (req, res) => {
  const getModelById = await modelsService.getByIdPublic(req.params.id);
  if (getModelById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getModelById, "");
  }
});

const deleteModelController = catchAsync(async (req, res) => {
  const deleteModel = await modelsService.deleteModel(req.params.id, req.userId);
  if (deleteModel) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Model Deleted");
  }
});

const uploadModelController = catchAsync(async (req, res) => {
  const uploadGLB = await modelsService.uploadGLB(req.params.id, req.userId, req);
  if (uploadGLB) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Model uploaded");
  }
});

const updateConfigController = catchAsync(async (req, res) => {
  const updateConfig = await modelsService.updateConfig(req.body, req.params.id, req.userId);
  if (updateConfig) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Config saved");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateModels = await modelsService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateModels) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateModels, "Models Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteModels = await modelsService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteModels) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteModels, "Models Deleted");
  }
});

const createVariationController = catchAsync(async (req, res) => {
  const createVariation = await modelsService.createVariation(req.body, req.params.id, req.userId, req);
  if (createVariation) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, createVariation, "Variation Created");
  }
});
const updateVariationController = catchAsync(async (req, res) => {
  const updateVariation = await modelsService.updateVariation(req.body, req.userId, req);
  if (updateVariation) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateVariation, "Variation Updated");
  }
});

const deleteVariationController = catchAsync(async (req, res) => {
  const deleteVariation = await modelsService.deleteVariation(req.params.id, req.userId);
  if (deleteVariation) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Variation Deleted");
  }
});

const modelLikeController = catchAsync(async (req, res) => {
  const likeModel = await modelsService.likeModel(req.params.id, req.userId, req.params.bool);
  if (likeModel) {
    return setSuccessResponse(res, StatusCodes.OK, true, likeModel, "Success");
  }
});

module.exports = {
  addController,
  updateController,
  getAllController,
  getAllWithSearchController,
  getByIdController,
  deleteModelController,
  uploadModelController,
  updateConfigController,
  multiUpdateController,
  multiDeleteController,
  createVariationController,
  updateVariationController,
  deleteVariationController,
  getAllModelsPublicController,
  getByIdModelPublicController,
  modelLikeController,
};
