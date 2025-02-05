"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects_bookmarks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      bookmarked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addConstraint("projects_bookmarks", {
      fields: ["project_id"],
      type: "foreign key",
      name: "FK_projects_bookmarks_project_id",
      references: {
        table: "projects",
        field: "id",
      },
    });

    await queryInterface.addConstraint("projects_bookmarks", {
      fields: ["user_id"],
      type: "foreign key",
      name: "FK_projects_bookmarks_user_id",
      references: {
        table: "users",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("projects_bookmarks", "FK_projects_bookmarks_project_id");
    await queryInterface.removeConstraint("projects_bookmarks", "FK_projects_bookmarks_user_id");
    await queryInterface.dropTable("projects_bookmarks");
  },
};
