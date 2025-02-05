'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class materials extends Model {
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
      this.belongsTo(models.material_colors, {
        foreignKey : "material_color_id"
      });
      this.hasMany(models.model_materials, {
        foreignKey: "material_id"
      })
    }
  }
  materials.init({
    user_id:{
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    material_color_id:{
      type: DataTypes.INTEGER,
      references: { model: "material_colors", key: "id" },
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    color: DataTypes.STRING,
    tags: DataTypes.STRING,
    price: DataTypes.FLOAT,
    status: DataTypes.ENUM("Active", "Inactive", "Draft"),
    thumbnail: DataTypes.STRING,
    is_deleted: DataTypes.BOOLEAN,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'materials',
  });

  materials.beforeCreate(async (materials, options) => {
    const slug = slugifyString(materials.name);
    materials.slug = slug;
  });

  return materials;
};