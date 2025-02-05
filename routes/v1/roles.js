const express = require("express");
const {
  addController,
  getAllController,
  updateByIdController,
  deleteByIdController,
  multiUpdateController,
  multiDeleteController,
} = require("../../controllers/roles.controllers");
const {
  addRoleSchema,
  getAllSchema,
  updateRoleSchema,
  deleteRoleSchema,
  multiUpdateSchema,
  multiDeleteSchema,
} = require("../../validators/roles");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(addRoleSchema, addController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllController);
router.route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`).put(updateRoleSchema, updateByIdController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteRoleSchema, deleteByIdController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);

module.exports = router;
