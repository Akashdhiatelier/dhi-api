const { Op } = require("sequelize");

const OPERATIONS = require("../repository/operations");

const db = require("../models");

const getAll = async (body) => {
  const { q } = body;

  const query = {
    where: {
      name: { [Op.like]: `%${q}%` },
    },
    attributes: ["id", "name", "slug"],
  };

  const findTags = await OPERATIONS.findAll(db.tags, query);
  return findTags;
};

module.exports = { getAll };
