const express = require("express");

const {
  getAllProjectsPublicController,
  getByIdProjectsPublicController,
  getProjectCommentsController,
} = require("../../controllers/projects.controllers");
const { getAllModelsPublicController, getByIdModelPublicController } = require("../../controllers/models.controllers");
const { getAllSchema, getByIdSchema } = require("../../validators/projects");
const modleSchema = require("../../validators/models");

const { getByIdMaterialPublicController } = require("../../controllers/materials.controllers");
const materialSchema = require("../../validators/materials");

const { CRUD_CONSTANTS, ROUTE_CONSTANTS } = require("../../utils/constants");
const { getAllLikesByProjectIdController, getAllLikesByModelIdController } = require("../../controllers/likes.controllers");
const { getAllBookmarksByProjectIdController } = require("../../controllers/project-bookmarks.controllers");
const { getCMSDataController } = require("../../controllers/cms.controllers");

const router = express.Router();

router.route(`/${ROUTE_CONSTANTS.PROJECTS}/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllProjectsPublicController);

router
  .route(`/${ROUTE_CONSTANTS.MODELS}/${CRUD_CONSTANTS.GET_ALL}`)
  .get(modleSchema.getAllSchema, getAllModelsPublicController);
router
  .route(`/${ROUTE_CONSTANTS.PROJECTS}/${CRUD_CONSTANTS.GET_BY_ID_PUBLIC}`)
  .get(getByIdSchema, getByIdProjectsPublicController);
router
  .route(`/${ROUTE_CONSTANTS.MODELS}/${CRUD_CONSTANTS.GET_BY_ID_PUBLIC}`)
  .get(getByIdSchema, getByIdModelPublicController);
router
  .route(`/${ROUTE_CONSTANTS.MATERIALS}/${CRUD_CONSTANTS.GET_BY_ID_PUBLIC}`)
  .get(materialSchema.getByIdSchema, getByIdMaterialPublicController);

// router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);

router.route(`/${ROUTE_CONSTANTS.MODELS}/${CRUD_CONSTANTS.GET_LIKES}`).get(getByIdSchema, getAllLikesByModelIdController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECTS}/${CRUD_CONSTANTS.GET_LIKES}`)
  .get(getByIdSchema, getAllLikesByProjectIdController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECTS}/${CRUD_CONSTANTS.GET_BOOKMARKS}`)
  .get(getByIdSchema, getAllBookmarksByProjectIdController);

router
  .route(`/${ROUTE_CONSTANTS.PROJECTS}/${ROUTE_CONSTANTS.PROJECT_CONSTANTS.GET_PROJECT_COMMENTS}`)
  .get(getByIdSchema, getProjectCommentsController);

router.route(`/${ROUTE_CONSTANTS.CMS}/:title`).get(getCMSDataController);

module.exports = router;
