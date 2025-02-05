const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addModuleSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const updateModuleSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    status: Joi.string().valid("Active", "Inactive", "Draft"),
  });
  validateRequest(req, res, next, schema);
};

const getByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const deleteModuleSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

module.exports = {
  addModuleSchema,
  updateModuleSchema,
  getByIdSchema,
  deleteModuleSchema,
};
