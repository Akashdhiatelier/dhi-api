'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class project_variations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.projects, {
        foreignKey: "project_id"
      });
      this.hasMany(models.project_variation_details, {
        foreignKey: "project_variation_id",
        as: "project_variation_details"
      });
    }
  }
  project_variations.init({
    project_id: {
      type: DataTypes.INTEGER,
      references: { model: "projects", key: "id" }
    },
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    thumbnail: DataTypes.STRING,
    positions: DataTypes.TEXT("long")
  }, {
    sequelize,
    modelName: 'project_variations',
  });
  return project_variations;
};