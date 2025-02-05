'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class models extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {
        foreignKey: "user_id"
      });
      this.belongsTo(models.categories, {
        foreignKey: "category_id"
      });
      this.hasMany(models.model_materials, {
        foreignKey: "model_id"
      });
      this.hasMany(models.model_variations, {
        foreignKey: "model_id"
      });
      this.hasMany(models.project_models, {
        foreignKey: "model_id"
      });
      this.hasMany(models.project_variation_details, {
        foreignKey: "model_id"
      });
      this.hasMany(models.model_likes, {
        foreignKey: "model_id"
      });
    }
  }
  models.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: { model: "categories", key: "id" }
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    description: DataTypes.STRING(1000),
    vendor_name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    tags: DataTypes.STRING,
    model_file: DataTypes.STRING,
    status: DataTypes.ENUM("Active", "Inactive", "Draft"),
    is_deleted: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'models',
  });

  models.beforeCreate(async (models, options) => {
    const slug = slugifyString(models.name);
    models.slug = slug;
  });

  return models;
};