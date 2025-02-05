require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const config = require("./config/config");
const CustomError = require("./utils/customError");

const swaggerDefinition = YAML.load("./docs/components.yaml");

const apiRoute = `${config.defaultRoute.apiBaseRoot}/${config.defaultRoute.apiVersion}`;

const app = express();

require("./middlewares")(app);

require("./routes")(app);

// load swagger
app.use(`/${apiRoute}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(new CustomError(400, "Not Found"));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  return res.status(err.status || 500).json({
    code: err.status || 500,
    success: false,
    data: null,
    errorMessage: err.errorMessage || "Internal Server Error",
  });
});

module.exports = app;
