'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class model_variation_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.model_variations, {
        foreignKey: "model_variations_id"
      });
      this.belongsTo(models.materials, {
        foreignKey: "material_id"
      });
    }
  }
  model_variation_details.init({
    model_variations_id: {
      type: DataTypes.INTEGER,
      references: { model: "model_variations", key: "id" }
    },
    material_id: {
      type: DataTypes.INTEGER,
      references: { model: "materials", key: "id" }
    },
    layer_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'model_variation_details',
  });
  return model_variation_details;
};