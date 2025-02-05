'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tags.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tags',
  });

  tags.beforeCreate(async (tags, options) => {
    const slug = slugifyString(tags.name);
    tags.slug = slug;
  });

  return tags;
};