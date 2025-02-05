const express = require("express");
const { getController } = require("../../controllers/tags.controllers");
const { getSchema } = require("../../validators/tags");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.GET}`).get(getSchema, getController);

module.exports = router;
