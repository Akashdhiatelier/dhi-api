'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class cms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cms.init({
    page_title: DataTypes.STRING,
    slug: DataTypes.STRING,
    content: DataTypes.TEXT("long"),
    is_deleted: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'cms',
  });

  cms.beforeCreate(async (cms, options) => {
    const slug = slugifyString(cms.page_title);
    cms.slug = slug;
  });

  return cms;
};