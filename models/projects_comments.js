'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class projects_comments extends Model {
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
  projects_comments.init({
    project_id: {
      type: DataTypes.INTEGER,
      references: { model: "projects", key: "id" }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    comments: DataTypes.TEXT('long'),
  }, {
    sequelize,
    modelName: 'projects_comments',
  });
  return projects_comments;
};