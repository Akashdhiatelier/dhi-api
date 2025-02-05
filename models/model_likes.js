'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class model_likes extends Model {
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
      this.belongsTo(models.users, {
        foreignKey: "user_id"
      });
    }
  }
  model_likes.init({
    model_id: {
      type: DataTypes.INTEGER,
      references: { model: "models", key: "id" }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    is_liked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'model_likes',
  });
  return model_likes;
};