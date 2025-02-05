const express = require("express");
const {
  addController,
  getAllController,
  getByIdController,
  updateController,
  deleteController,
  multiUpdateController,
  multiDeleteController,
} = require("../../controllers/categories.controllers");
const {
  addCategories,
  updateCategories,
  getByIdSchema,
  deleteCategories,
  getAllSchema,
  multiUpdateSchema,
  multiDeleteSchema,
} = require("../../validators/categories");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(addCategories, addController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);
router.route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`).put(updateCategories, updateController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteCategories, deleteController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);

module.exports = router;
