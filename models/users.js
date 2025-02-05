"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.roles , {
        foreignKey : "role_id"
      });
      this.hasMany(models.tokens, {
        foreignKey: "user_id"
      });
      this.hasMany(models.models, {
        foreignKey: "user_id"
      });
      this.hasMany(models.projects, {
        foreignKey: "user_id"
      });
      this.hasMany(models.projects_likes, {
        foreignKey: "user_id"
      })
      this.hasMany(models.model_likes, {
        foreignKey: "user_id"
      })
      this.hasMany(models.projects_comments, {
        foreignKey: "user_id"
      })
    }
  }
  users.init(
    {
      role_id:{
        type: DataTypes.INTEGER,
        references: { model: "roles", key: "id" },
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar_url: DataTypes.STRING,
      avatar: DataTypes.STRING,
      status: DataTypes.ENUM("Active", "Inactive", "Draft"),
      fingerprint: DataTypes.STRING,
      is_verified: DataTypes.BOOLEAN,
      is_deleted: DataTypes.BOOLEAN,
      verified_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "users",
    }
  );
  return users;
};
