"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class modules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.role_permissions, {
        foreignKey: "module_id"
      });
    }
  }
  modules.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      status: DataTypes.ENUM("Active", "Inactive", "Draft"),
      is_deleted: DataTypes.BOOLEAN,
      deleted_at: DataTypes.DATE,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "modules",
    }
  );
  return modules;
};
