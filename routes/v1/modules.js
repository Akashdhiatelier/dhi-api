const express = require("express");
const {
  addController,
  getAllController,
  getModuleByIdController,
  updateByIdController,
  deleteByIdController,
} = require("../../controllers/modules.controllers");
const { addModuleSchema, updateModuleSchema, getByIdSchema, deleteModuleSchema } = require("../../validators/modules");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(addModuleSchema, addController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getModuleByIdController);
router.route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`).put(updateModuleSchema, updateByIdController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteModuleSchema, deleteByIdController);

module.exports = router;
