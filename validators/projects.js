const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const custom = Joi.extend({
  type: "array",
  base: Joi.array(),
  coerce: {
    from: "string",
    method(value, helpers) {
      if (typeof value !== "string" || (value[0] !== "[" && !/^\s*\[/.test(value))) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (ignoreErr) {}
    },
  },
});

const addProjectSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    tags: custom
      .array()
      .when("infected", {
        is: true,
        then: custom.array().min(1).required(),
      })
      .allow(""),
    description: Joi.string().allow("").allow(null),
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

const getAllProjectLikeSchema = (req, res, next) => {
  const schema = Joi.object({
    _page: Joi.number().integer().required().default(1),
    _limit: Joi.number().integer().required().default(10),
    _sort: Joi.string().default("id"),
    _order: Joi.string().default("desc"),
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

const projectMediaQuerySchema = (req, res, next) => {
  const schema = Joi.object({
    media: Joi.string().required(),
  });
  validateRequest(req, res, next, schema, true, false);
};

const addProjectCommentSchema = (req, res, next) => {
  const schema = Joi.object({
    comment: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};

const updateProjectConfigSchema = (req, res, next) => {
  const schema = Joi.object({
    config: Joi.array().items(
      Joi.object({
        model_id: Joi.number().integer().required(),
        object_id: Joi.string().required(),
        allow_change: Joi.boolean().default(false).required(),
        allow_move: Joi.boolean().default(false).required(),
      })
    ),
  });
  validateRequest(req, res, next, schema);
};

const multiUpdateSchema = (req, res, next) => {
  const schema = Joi.object({
    project_ids: Joi.array().items(Joi.number().integer().required()),
    status: Joi.string().valid("Active", "Inactive", "Draft").required(),
  });
  validateRequest(req, res, next, schema);
};

const multiDeleteSchema = (req, res, next) => {
  const schema = Joi.object({
    project_ids: Joi.array().items(Joi.number().integer().required()),
  });
  validateRequest(req, res, next, schema);
};

const createVariationSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().allow(null).allow(""),
    price: Joi.number().precision(2).required(),
    positions: Joi.string().allow(""),
    variation: Joi.string().allow(""),
  });
  validateRequest(req, res, next, schema);
};

const updateVariationSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().required(),
    price: Joi.number().precision(2).required(),
    positions: Joi.string().allow(""),
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
  addProjectSchema,
  getAllSchema,
  getAllProjectLikeSchema,
  getByIdSchema,
  projectMediaQuerySchema,
  updateProjectConfigSchema,
  multiUpdateSchema,
  multiDeleteSchema,
  createVariationSchema,
  updateVariationSchema,
  deleteVariationSchema,
  addProjectCommentSchema,
};
