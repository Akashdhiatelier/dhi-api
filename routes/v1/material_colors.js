const express = require("express");
const {
  addController,
  getAllController,
  updateController,
  deleteController,
} = require("../../controllers/material-colors.controllers");
const { addMaterialColor, updateMaterialColor, deleteMaterialColor } = require("../../validators/material_colors");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(addMaterialColor, addController);
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllController);
router.route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`).put(updateMaterialColor, updateController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteMaterialColor, deleteController);

module.exports = router;
