"use strict";
const { Model } = require("sequelize");
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.users, {
        foreignKey : "role_id"
      });
      this.hasMany(models.role_permissions, {
        foreignKey: "role_id"
      })
      // define association here
    }
  }
  roles.init(
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
      modelName: "roles",
    }
  );

  roles.beforeCreate(async (roles, options) => {
    const slug = slugifyString(roles.name);
    roles.slug = slug;
  });

  return roles;
};
