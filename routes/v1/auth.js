const express = require("express");
const {
  loginController,
  registerController,
  verifyController,
  passwordUpdateController,
  forgetPasswordController,
} = require("../../controllers/auth.controllers");
const {
  loginSchema,
  registerSchema,
  verifySchema,
  updatePasswordSchema,
  forgetPasswordSchema,
} = require("../../validators/auth");
const { upload, optimizeAndSaveImage } = require("../../middlewares/uploadOptimizeImage");
const { AUTH_CONSTANTS } = require("../../utils/constants");
const authMiddleware = require("../../middlewares/auth");

const router = express.Router();

router.get("/demo", function (req, res) {
  return res.render("index", { title: " auth routes" });
});

// auth
router.route(`/${AUTH_CONSTANTS.LOGIN}`).post(loginSchema, loginController);
router
  .route(`/${AUTH_CONSTANTS.REGISTER}`)
  .post(authMiddleware, upload("avatar"), optimizeAndSaveImage, registerSchema, registerController);
router.route(`/${AUTH_CONSTANTS.VERIFY_USER}`).get(verifySchema, verifyController);
router.route(`/${AUTH_CONSTANTS.RESET_PASSWORD}`).put(updatePasswordSchema, passwordUpdateController);
router.route(`/${AUTH_CONSTANTS.FORGOT_PASSWORD}`).post(forgetPasswordSchema, forgetPasswordController);

module.exports = router;
