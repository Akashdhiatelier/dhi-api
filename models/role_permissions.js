"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class role_permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.roles, {
        foreignKey: "role_id"
      });
      this.belongsTo(models.modules, {
        foreignKey: "module_id"
      });
    }
  }
  role_permissions.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        references : { model: "roles", key: "id" }
      },
      module_id: {
        type:DataTypes.INTEGER,
        // references : { model: "modules", key: "id" }
      },
      read: DataTypes.BOOLEAN,
      write: DataTypes.BOOLEAN,
      update: DataTypes.BOOLEAN,
      delete: DataTypes.BOOLEAN,
      status: DataTypes.ENUM("Active", "Inactive", "Draft"),
      is_deleted: DataTypes.BOOLEAN,
      deleted_at: DataTypes.DATE,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "role_permissions",
    }
  );
  return role_permissions;
};
