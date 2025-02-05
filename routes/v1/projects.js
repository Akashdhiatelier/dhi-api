const express = require("express");

const uploadImage = require("../../middlewares/uploadImage");

const {
  getAllController,
  addProjectController,
  updateProjectController,
  getByIdController,
  deleteByIdController,
  uploadProjectController,
  multiUpdateController,
  multiDeleteController,
  updateProjectConfigController,
  createVariationController,
  updateVariationController,
  deleteVariationController,
  saveCameraViewController,
  projectLikeController,
  projectSaveController,
  projectAddMediaController,
  projectDeleteMediaController,
  addProjectCommentController,
  getAllLikedProjectController,
} = require("../../controllers/projects.controllers");
const {
  getAllSchema,
  addProjectSchema,
  getByIdSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  updateProjectConfigSchema,
  createVariationSchema,
  updateVariationSchema,
  deleteVariationSchema,
  projectMediaQuerySchema,
  addProjectCommentSchema,
  getAllProjectLikeSchema,
} = require("../../validators/projects");

const { CRUD_CONSTANTS, ROUTE_CONSTANTS } = require("../../utils/constants");
const uploadMultipleFiles = require("../../middlewares/uploadMultipleFiles");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(getByIdSchema, deleteByIdController);
router.route(`/${CRUD_CONSTANTS.UPLOAD_BY_ID}`).put(uploadImage("project", "projects"), uploadProjectController);
router.route(`/${CRUD_CONSTANTS.ADD}`).post(uploadImage("thumbnail", "thumbnails"), addProjectSchema, addProjectController);
router
  .route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`)
  .put(uploadImage("thumbnail", "thumbnails"), addProjectSchema, updateProjectController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);
router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.UPDATE_PROJECT_CONFIG}`)
  .post(updateProjectConfigSchema, updateProjectConfigController);
router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.CREATE_VARIATION}`)
  .post(uploadImage("thumbnail", "thumbnails"), createVariationSchema, createVariationController);
router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.UPDATE_VARIATION}`)
  .put(uploadImage("thumbnail", "thumbnails"), updateVariationSchema, updateVariationController);
router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.DELETE_VARIATION}`)
  .delete(deleteVariationSchema, deleteVariationController);
router.route(`/${CRUD_CONSTANTS.ADD_CAMERAS_VIEWS}`).post(saveCameraViewController);

router.route(`/${CRUD_CONSTANTS.LIKE}`).post(getByIdSchema, projectLikeController);
router.route(`/${CRUD_CONSTANTS.SAVE}`).post(getByIdSchema, projectSaveController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.ADD_PROJECT_MEDIA}`)
  .post(uploadMultipleFiles.array("projectMedia", 10), getByIdSchema, projectAddMediaController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.DELETE_PROJECT_MEDIA}`)
  .delete(getByIdSchema, projectMediaQuerySchema, projectDeleteMediaController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.ADD_PROJECT_COMMENT}`)
  .post(addProjectCommentSchema, addProjectCommentController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.GET_ALL_LIKED_PROJECTS}`)
  .get(getAllProjectLikeSchema, getAllLikedProjectController);
module.exports = router;
