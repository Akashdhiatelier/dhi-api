'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class web_cms extends Model {
    static associate(models) {
    }
  }
  web_cms.init({
    title: {
      type: DataTypes.ENUM("project-showcase"),
      allowNull: false
    },
    media: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type:DataTypes.INTEGER,
      defaultValue: 1
    },
    is_deleted: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'web_cms',
  });

  return web_cms;
};