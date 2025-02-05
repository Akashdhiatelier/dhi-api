const express = require("express");
const {
  addController,
  getAllController,
  getByIdController,
  updateController,
  deleteController,
  multiUpdateController,
  multiDeleteController,
} = require("../../controllers/materials.controllers");
const {
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getByIdSchema,
  getAllSchema,
  multiUpdateSchema,
  multiDeleteSchema,
} = require("../../validators/materials");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const { upload, optimizeAndSaveImage } = require("../../middlewares/uploadOptimizeImage");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(upload("material"), optimizeAndSaveImage, addMaterial, addController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllController);
router
  .route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`)
  .put(upload("material"), optimizeAndSaveImage, updateMaterial, updateController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteMaterial, deleteController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);

module.exports = router;
