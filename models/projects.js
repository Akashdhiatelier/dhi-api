'use strict';
const { Model } = require('sequelize');
const { slugifyString } = require('../utils/common');

module.exports = (sequelize, DataTypes) => {
  class projects extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: "user_id"
      });
      this.hasMany(models.project_models, {
        foreignKey: "project_id",
        as: "models"
      });
      this.hasMany(models.project_variations, {
        foreignKey: "project_id",
        as: "project_variations"
      });
      this.hasMany(models.projects_likes, {
        foreignKey: "project_id",
        as: "projects_likes"
      })
      this.hasMany(models.projects_comments, {
        foreignKey: "project_id",
        as: "projects_comments"
      })
    }
  }
  projects.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" }
    },
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    thumbnail: DataTypes.STRING,
    description: DataTypes.TEXT('long'),
    price: DataTypes.FLOAT,
    tags: DataTypes.STRING,
    project_file: DataTypes.STRING,
    media: DataTypes.TEXT('long'),
    status: DataTypes.ENUM("Active", "Inactive", "Draft"),
    camera_views: {
      type: DataTypes.TEXT('long'),
    },
    is_deleted: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'projects',
  });

  projects.beforeCreate(async (projects, options) => {
    const slug = slugifyString(projects.name);
    projects.slug = slug;
  });

  return projects;
};