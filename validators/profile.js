const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const updateProfileById = (req, res, next) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
  });
  validateRequest(req, res, next, schema);
};

const setPasswordSchema = (req, res, next) => {
  const schema = Joi.object({
    current_password: Joi.string().min(6).max(16).required(),
    password: Joi.string().min(6).max(16).required(),
    confirm_password: Joi.string().required().valid(Joi.ref("password")).label("confirm_password"),
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  updateProfileById,
  setPasswordSchema,
};
