const express = require("express");
const {
  getByIdController,
  updateByIdController,
  setPasswordController,
  deleteProfileController,
} = require("../../controllers/profile.controllers");
const { optimizeAndSaveImage, upload } = require("../../middlewares/uploadOptimizeImage");

const { CRUD_CONSTANTS, AUTH_CONSTANTS } = require("../../utils/constants");
const { updateProfileById, setPasswordSchema } = require("../../validators/profile");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.GET}`).get(getByIdController);
router
  .route(`/${CRUD_CONSTANTS.UPDATE}`)
  .put(upload("avatar"), optimizeAndSaveImage, updateProfileById, updateByIdController);
router.route(`/${AUTH_CONSTANTS.SET_PASSWORD}`).put(setPasswordSchema, setPasswordController);
router.route(`/${AUTH_CONSTANTS.DELETE_PROFILE}`).put(deleteProfileController);

module.exports = router;
