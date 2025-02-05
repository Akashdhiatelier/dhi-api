'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class material_colors extends Model {
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
      this.hasMany(models.materials, {
        foreignKey : "material_color_id"
      });
    }
  }
  material_colors.init({
    user_id:{
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    color: DataTypes.STRING,
    is_deleted: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'material_colors',
  });

  material_colors.beforeCreate(async (material_colors, options) => {
    const slug = slugifyString(material_colors.name);
    material_colors.slug = slug;
  });

  return material_colors;
};