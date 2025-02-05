const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const getByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    slug: Joi.string().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const updateCmsSchema = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  getByIdSchema,
  updateCmsSchema,
};
