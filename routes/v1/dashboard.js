const express = require("express");
const { getStaticsticsController } = require("../../controllers/dashboard.controllers");

const { CRUD_CONSTANTS } = require("../../utils/constants");

const router = express.Router();

router.route(`/${CRUD_CONSTANTS.GET_STATICSTICS}`).get(getStaticsticsController);

module.exports = router;
