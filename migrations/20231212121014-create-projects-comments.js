"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projects_comments", {
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
      comments: {
        type: Sequelize.TEXT("long"),
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

    await queryInterface.addConstraint("projects_comments", {
      fields: ["project_id"],
      type: "foreign key",
      name: "FK_projects_comments_project_id",
      references: {
        table: "projects",
        field: "id",
      },
    });

    await queryInterface.addConstraint("projects_comments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "FK_projects_comments_user_id",
      references: {
        table: "users",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("projects_comments", "FK_projects_comments_project_id");
    await queryInterface.removeConstraint("projects_comments", "FK_projects_comments_user_id");
    await queryInterface.dropTable("projects_comments");
  },
};
