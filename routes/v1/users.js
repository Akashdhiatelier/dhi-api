const express = require("express");
const {
  getAllUsersController,
  updateByIdController,
  getUserByIdController,
  multiUpdateController,
  multiDeleteController,
  deleteByIdController,
  updatePublicUserController,
} = require("../../controllers/users.controllers");
const { upload, optimizeAndSaveImage } = require("../../middlewares/uploadOptimizeImage");

const { CRUD_CONSTANTS, ROUTE_CONSTANTS } = require("../../utils/constants");
const {
  getAllSchema,
  updateUserSchema,
  getUserByIdSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  deleteUserSchema,
  updatePublicUserSchema,
} = require("../../validators/users");

const router = express.Router();

router.get("/demo", function (req, res) {
  return res.render("index", { title: " user routes" });
});

// auth
router.route(`/${CRUD_CONSTANTS.GET_ALL}`).get(getAllSchema, getAllUsersController);
router
  .route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`)
  .put(upload("avatar"), optimizeAndSaveImage, updateUserSchema, updateByIdController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getUserByIdSchema, getUserByIdController);
router.route(`/${CRUD_CONSTANTS.MULTI_UPDATE}`).put(multiUpdateSchema, multiUpdateController);
router.route(`/${CRUD_CONSTANTS.MULTI_DELETE}`).put(multiDeleteSchema, multiDeleteController);
router.route(`/${CRUD_CONSTANTS.DELTE_BY_ID}`).put(deleteUserSchema, deleteByIdController);
router
  .route(`/public/${CRUD_CONSTANTS.UPDATE}`)
  .put(upload("avatar"), optimizeAndSaveImage, updatePublicUserSchema, updatePublicUserController);
module.exports = router;
