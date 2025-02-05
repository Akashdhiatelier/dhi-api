const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addRolePermissionsSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").default("Active").required(),
    permissions: Joi.array().items(
      Joi.object({
        module_id: Joi.number().integer().required(),
        read: Joi.boolean().default(false).required(),
        write: Joi.boolean().default(false).required(),
        update: Joi.boolean().default(false).required(),
        delete: Joi.boolean().default(false).required(),
        status: Joi.string().valid("Active", "Inactive", "Draft").default("Active"),
      })
    ),
  });
  validateRequest(req, res, next, schema);
};

const getByIdSchema = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

const updateRolePermissionSchema = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    status: Joi.string().valid("Active", "Inactive", "Draft").default("Active").required(),
    permissions: Joi.array().items(
      Joi.object({
        module_id: Joi.number().integer().required(),
        read: Joi.boolean().default(false).required(),
        write: Joi.boolean().default(false).required(),
        update: Joi.boolean().default(false).required(),
        delete: Joi.boolean().default(false).required(),
        status: Joi.string().valid("Active", "Inactive", "Draft").default("Active"),
      })
    ),
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  addRolePermissionsSchema,
  getByIdSchema,
  updateRolePermissionSchema,
};
