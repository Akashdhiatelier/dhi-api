const express = require("express");

const {
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
  modelLikeController,
} = require("../../controllers/models.controllers");
const {
  addModelsSchema,
  getAllSchema,
  getByIdSchema,
  deleteModelSchema,
  updateModelConfigSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  createVariationSchema,
  updateVariationSchema,
  deleteVariationSchema,
} = require("../../validators/models");
const { CRUD_CONSTANTS, ROUTE_CONSTANTS } = require("../../utils/constants");
const { optimizeAndSaveImage, upload } = require("../../middlewares/uploadOptimizeImage");
const uploadImage = require("../../middlewares/uploadImage");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(upload("models"), optimizeAndSaveImage, addModelsSchema, addController);
router
  .route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`)
  .put(upload("models"), optimizeAndSaveImage, addModelsSchema, updateController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllController);
router.route(`/${CRUD_CONSTANTS.GET}`).get(getAllWithSearchController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteModelSchema, deleteModelController);
router.route(`/${CRUD_CONSTANTS.UPLOAD_BY_ID}`).put(uploadImage("model", "models"), uploadModelController);
router.route(`/${ROUTE_CONSTANTS.MODEL_CONSTANTS.UPDATE_MODEL_CONFIG}`).put(updateModelConfigSchema, updateConfigController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);

router
  .route(`/${ROUTE_CONSTANTS.MODEL_CONSTANTS.CREATE_VARIATION}`)
  .post(uploadImage("thumbnail", "thumbnails"), createVariationSchema, createVariationController);
router
  .route(`/${ROUTE_CONSTANTS.MODEL_CONSTANTS.UPDATE_VARIATION}`)
  .put(uploadImage("thumbnail", "thumbnails"), updateVariationSchema, updateVariationController);
router
  .route(`/${ROUTE_CONSTANTS.MODEL_CONSTANTS.DELETE_VARIATION}`)
  .delete(deleteVariationSchema, deleteVariationController);

router.route(`/${CRUD_CONSTANTS.LIKE}`).post(getByIdSchema, modelLikeController);

module.exports = router;
