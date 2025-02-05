'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class project_variation_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.project_variations, {
        foreignKey: "project_variation_id"
      });
      this.belongsTo(models.models, {
        foreignKey: "model_id"
      });
    }
  }
  project_variation_details.init({
    project_variation_id: {
      type: DataTypes.INTEGER,
      references: { model: "project_variations", key: "id" }
    },
    model_id: {
      type: DataTypes.INTEGER,
      references: { model: "models", key: "id" }
    },
    object_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'project_variation_details',
  });
  return project_variation_details;
};