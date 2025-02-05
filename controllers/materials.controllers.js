const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const materialService = require("../services/materials");
const { setSuccessResponse } = require("../utils/sendResponse");

const addController = catchAsync(async (req, res) => {
  const addNew = await materialService.add(req.body, req.userId, req);
  if (addNew) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addNew, "");
  }
});

const getAllController = catchAsync(async (req, res) => {
  const getAllMaterials = await materialService.getAll(req.body, req.userId);
  if (getAllMaterials) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllMaterials, "");
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const getMaterialsById = await materialService.getById(req.params.id, req.userId, req.roleId);
  if (getMaterialsById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getMaterialsById, "");
  }
});
const getByIdMaterialPublicController = catchAsync(async (req, res) => {
  const getMaterialsById = await materialService.getByIdPublic(req.params.id);
  if (getMaterialsById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getMaterialsById, "");
  }
});

const updateController = catchAsync(async (req, res) => {
  const updateMaterial = await materialService.update(req.body, req.params.id, req.userId, req);
  if (updateMaterial) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Material updated");
  }
});

const deleteController = catchAsync(async (req, res) => {
  const deleteMaterial = await materialService.deleteMaterialById(req.params.id, req.userId);
  if (deleteMaterial) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Material deleted");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateMaterials = await materialService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateMaterials) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateMaterials, "Materials Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteMaterials = await materialService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteMaterials) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteMaterials, "Materials Deleted");
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
  getByIdMaterialPublicController,
};
