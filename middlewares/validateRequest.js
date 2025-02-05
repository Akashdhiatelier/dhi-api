const { StatusCodes } = require("http-status-codes");
const CustomError = require("../utils/customError");
// const fs = require("fs");

const { unlinkFile } = require("../utils/common");

const validateRequest = (req, res, next, schema, isQuery = false, isParam = false) => {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  let validate;

  if (isQuery) {
    validate = req.query;
  } else if (isParam) {
    validate = req.params;
  } else {
    validate = req.body;
  }

  const { error, value } = schema.validate(validate, options);

  if (error) {
    // next(`Validation error: ${error.details.map((x) => x.message).join(', ')}`);
    const customErrorObj = error.details.reduce(
      (prev, cur) => ({
        ...prev,
        [cur.path]: { message: cur.message.replaceAll('"', "") },
      }),
      {}
    );
    if (req.file) {
      unlinkFile(req);
    }
    // throw new CustomError(StatusCodes.NOT_ACCEPTABLE, error.details[0].message.replaceAll('"', "'"));
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, customErrorObj);
  } else {
    req.body = value;
    next();
  }
};

module.exports = validateRequest;
