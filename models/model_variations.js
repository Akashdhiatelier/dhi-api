'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class model_variations extends Model {
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
      this.hasMany(models.model_variation_details, {
        as: "details", foreignKey: "model_variations_id"
      });
    }
  }
  model_variations.init({
    model_id: {
      type: DataTypes.INTEGER,
      references: { model: "models", key: "id" }
    },
    name: DataTypes.STRING,
    price: DataTypes.FLOAT(10, 2),
    thumbnail: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'model_variations',
  });
  return model_variations;
};