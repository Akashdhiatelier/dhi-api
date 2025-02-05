const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const getAllSchema = (req, res, next) => {
  const schema = Joi.object({
    _page: Joi.number().integer().required().default(1),
    _limit: Joi.number().integer().required().default(10),
    _sort: Joi.string().default("id"),
    _order: Joi.string().default("desc"),
    role: Joi.string(),
    status: Joi.string().valid("All", "Active", "Inactive", "Draft").default("All"),
    q: [Joi.string().optional(), Joi.allow(null)],
  });
  validateRequest(req, res, next, schema, true);
};

const updateUserSchema = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.number().integer().not(1).required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};
const updatePublicUserSchema = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  validateRequest(req, res, next, schema);
};

const getUserByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const multiUpdateSchema = (req, res, next) => {
  const schema = Joi.object({
    user_ids: Joi.array().items(Joi.number().integer().required()),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const multiDeleteSchema = (req, res, next) => {
  const schema = Joi.object({
    user_ids: Joi.array().items(Joi.number().integer().required()),
  });
  validateRequest(req, res, next, schema);
};

const deleteUserSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().not(1).required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

module.exports = {
  getAllSchema,
  updateUserSchema,
  updatePublicUserSchema,
  getUserByIdSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  deleteUserSchema,
};
