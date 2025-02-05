const express = require("express");
const { addController, updateController, getByIdController } = require("../../controllers/role-permissions.controllers");
const { addRolePermissionsSchema, getByIdSchema, updateRolePermissionSchema } = require("../../validators/role-permissions");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.ADD}`).post(addRolePermissionsSchema, addController);
router.route(`/${CRUD_CONSTANTS.GET_BY_ID}`).get(getByIdSchema, getByIdController);
router.route(`/${CRUD_CONSTANTS.UPDATE_BY_ID}`).put(updateRolePermissionSchema, updateController);

module.exports = router;
