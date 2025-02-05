'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class projects_bookmarks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.projects, {
        foreignKey: "project_id"
      });
      this.belongsTo(models.users, {
        foreignKey: "user_id"
      });
    }
  }
  projects_bookmarks.init({
    project_id: {
      type: DataTypes.INTEGER,
      references: { model: "projects", key: "id" }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    bookmarked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'projects_bookmarks',
  });
  return projects_bookmarks;
};