'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class project_models extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.projects, {
        foreignKey: "project_id"
      });
      this.belongsTo(models.models, {
        foreignKey: "model_id"
      });
    }
  }
  project_models.init({
    project_id: {
      type: DataTypes.INTEGER,
      references: { model: "projects", key: "id" }
    },
    model_id: {
      type: DataTypes.INTEGER,
      references: { model: "models", key: "id" }
    },
    object_id: DataTypes.STRING,
    allow_change: DataTypes.BOOLEAN,
    allow_move: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'project_models',
  });
  return project_models;
};