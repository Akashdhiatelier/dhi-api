const Joi = require("joi");
const validateRequest = require("../middlewares/validateRequest");

const getSchema = (req, res, next) => {
  const schema = Joi.object({
    q: [Joi.string().optional(), Joi.allow(null)],
  });
  validateRequest(req, res, next, schema);
};

module.exports = {
  getSchema,
};
