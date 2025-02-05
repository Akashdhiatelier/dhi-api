'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class model_materials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.models, {
        foreignKey: "model_id"
      });
      this.belongsTo(models.materials, {
        foreignKey: "material_id"
      });
    }
  }
  model_materials.init({
    model_id: {
      type: DataTypes.INTEGER,
      references: { model: "models", key: "id" }
    },
    material_id: {
      type: DataTypes.INTEGER,
      references: { model: "materials", key: "id" }
    },
    layer_id: DataTypes.STRING,
    allow_change: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'model_materials',
  });
  return model_materials;
};