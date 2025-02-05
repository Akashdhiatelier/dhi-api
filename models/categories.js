'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class categories extends Model {
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
    }
  }
  categories.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    status: DataTypes.ENUM("Active", "Inactive", "Draft"),
    is_deleted: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'categories',
  });

  categories.beforeCreate(async (categories, options) => {
    const slug = slugifyString(categories.name);
    categories.slug = slug;
  });
  
  return categories;
};