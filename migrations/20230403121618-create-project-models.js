"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_models", {
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
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "models",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      object_id: {
        type: Sequelize.STRING,
      },
      allow_change: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      allow_move: {
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

    await queryInterface.addConstraint("project_models", {
      fields: ["project_id"],
      type: "foreign key",
      name: "FK_project_models_project_id",
      references: {
        table: "projects",
        field: "id",
      },
    });

    await queryInterface.addConstraint("project_models", {
      fields: ["model_id"],
      type: "foreign key",
      name: "FK_project_models_model_id",
      references: {
        table: "models",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("project_models", "FK_project_models_project_id");
    await queryInterface.removeConstraint("project_models", "FK_project_models_model_id");
    await queryInterface.dropTable("project_models");
  },
};
