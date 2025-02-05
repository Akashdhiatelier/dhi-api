const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addMaterial = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    color: Joi.number().integer().required(),
    tags: Joi.string().allow(""),
    price: Joi.number().precision(2).required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").default("Active").required(),
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

const updateMaterial = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    color: Joi.number().integer().required(),
    tags: Joi.string().allow(""),
    price: Joi.number().precision(2).required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").default("Active").required(),
  });
  validateRequest(req, res, next, schema);
};

const getByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const deleteMaterial = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const multiUpdateSchema = (req, res, next) => {
  const schema = Joi.object({
    material_ids: Joi.array().items(Joi.number().integer().required()),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const multiDeleteSchema = (req, res, next) => {
  const schema = Joi.object({
    material_ids: Joi.array().items(Joi.number().integer().required()),
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  addMaterial,
  getAllSchema,
  getByIdSchema,
  updateMaterial,
  deleteMaterial,
  multiUpdateSchema,
  multiDeleteSchema,
};
