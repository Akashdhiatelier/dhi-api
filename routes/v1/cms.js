const express = require("express");
const {
  getBySlugController,
  updateBySlugController,
  addWebCMSController,
  updateWebCMSController,
  deleteWebCMSController,
} = require("../../controllers/cms.controllers");
const { getByIdSchema: getSlugBySchema, updateCmsSchema } = require("../../validators/cms");
const uploadImage = require("../../middlewares/uploadImage");
const { getByIdSchema } = require("../../validators/projects");

const router = express.Router();

router.route(`/:slug`).get(getSlugBySchema, getBySlugController);
router.route(`/:slug`).put(updateCmsSchema, updateBySlugController);
router.route("/web/:title/:order").post(uploadImage("media"), addWebCMSController);
router.route("/web/:id").put(uploadImage("media"), updateWebCMSController);
router.route("/web/:id").delete(getByIdSchema, deleteWebCMSController);

module.exports = router;
