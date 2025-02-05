const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addModelsSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    category: Joi.number().integer().required(),
    tags: Joi.string().allow(""),
    description: Joi.string().allow("").allow(null),
    vendor_name: Joi.string().allow("").allow(null),
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
    category: Joi.string().default("All"),
    status: Joi.string().valid("All", "Active", "Inactive", "Draft").default("All"),
    q: [Joi.string().optional(), Joi.allow(null)],
  });
  validateRequest(req, res, next, schema, true);
};

const getByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const deleteModelSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const updateModelConfigSchema = (req, res, next) => {
  const schema = Joi.object({
    config: Joi.array().items(
      Joi.object({
        material_id: Joi.number().integer().required(),
        layer_id: Joi.string().required(),
        allow_change: Joi.boolean().default(false).required(),
      })
    ),
  });
  validateRequest(req, res, next, schema);
};

const multiUpdateSchema = (req, res, next) => {
  const schema = Joi.object({
    model_ids: Joi.array().items(Joi.number().integer().required()),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const multiDeleteSchema = (req, res, next) => {
  const schema = Joi.object({
    model_ids: Joi.array().items(Joi.number().integer().required()),
  });
  validateRequest(req, res, next, schema);
};

const createVariationSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().allow(null).allow(""),
    price: Joi.number().precision(2).required(),
    variation: Joi.string().allow(""),
  });
  validateRequest(req, res, next, schema);
};

const updateVariationSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().required(),
    price: Joi.number().precision(2).required(),
    variation: Joi.string().allow(""),
  });
  validateRequest(req, res, next, schema);
};

const deleteVariationSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

module.exports = {
  addModelsSchema,
  getAllSchema,
  getByIdSchema,
  deleteModelSchema,
  updateModelConfigSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  createVariationSchema,
  updateVariationSchema,
  deleteVariationSchema,
};
