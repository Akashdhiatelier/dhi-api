const express = require("express");
const path = require("path");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cors = require("cors");
const Fingerprint = require("express-fingerprint");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const morgan = require("../config/morgan");
const config = require("../config/config");

module.exports = function (app) {
  if (config.env !== "test") {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
  }

  // set security HTTP Headers
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  // sanitise request data
  app.use(xss());

  // rate limiter
  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  app.use(limiter);

  // add device fingerprint
  app.use(
    Fingerprint({
      parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders, Fingerprint.geoip],
    })
  );

  // gzip compression
  const shouldCompress = (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  };
  app.use(compression({ filter: shouldCompress }));

  // enable cors
  app.use(cors());
  app.options("*", cors());
  app.set("trust proxy", "127.0.0.1");

  // view engine setup
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "hbs");

  app.use(logger("dev"));
  // parse JSON request body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    "/public",
    express.static(path.join(__dirname, "..", "public"), {
      setHeaders: (res, path, stat) => {
        res.set("Access-Control-Allow-Origin", "*");
      },
    })
  );
};
