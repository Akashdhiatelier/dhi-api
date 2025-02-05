'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.users , {
        foreignKey : "user_id"
      });
      // define association here
    }
  }
  tokens.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    type: DataTypes.ENUM("Verify", "Reset", "Auth"),
    token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tokens',
  });
  return tokens;
};