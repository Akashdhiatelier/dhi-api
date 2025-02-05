const express = require("express");

const logoutService = require("../../services/logout");

const router = express.Router();

router.route("").get(logoutService.logout);

module.exports = router;
