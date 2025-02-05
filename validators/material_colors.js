const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const addMaterialColor = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    color: Joi.string()
      .regex(/^#[A-Fa-f0-9]{6}/)
      .required(),
  });
  validateRequest(req, res, next, schema);
};

const updateMaterialColor = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string(),
    color: Joi.string().regex(/^#[A-Fa-f0-9]{6}/),
  });
  validateRequest(req, res, next, schema);
};

const deleteMaterialColor = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema, false, true);
};

module.exports = {
  addMaterialColor,
  updateMaterialColor,
  deleteMaterialColor,
};
