const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addRoleSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const getAllSchema = (req, res, next) => {
  const schema = Joi.object({
    _page: Joi.number().integer().required().default(1),
    _limit: Joi.number().integer().required().default(10),
    _sort: Joi.string().default("id"),
    _order: Joi.string().default("desc"),
    status: Joi.string().valid("All", "Active", "Inactive", "Draft").default("All"),
    q: [Joi.string().optional(), Joi.allow(null)],
  });
  validateRequest(req, res, next, schema, true);
};

const updateRoleSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string(),
    status: Joi.string().valid("Active", "Inactive", "Draft"),
  });
  validateRequest(req, res, next, schema);
};

const deleteRoleSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const multiUpdateSchema = (req, res, next) => {
  const schema = Joi.object({
    role_ids: Joi.array().items(Joi.number().integer().required()),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const multiDeleteSchema = (req, res, next) => {
  const schema = Joi.object({
    role_ids: Joi.array().items(Joi.number().integer().required()),
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  addRoleSchema,
  getAllSchema,
  updateRoleSchema,
  deleteRoleSchema,
  multiUpdateSchema,
  multiDeleteSchema,
};
