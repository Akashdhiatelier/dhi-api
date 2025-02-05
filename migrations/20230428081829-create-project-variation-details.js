"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_variation_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      project_variation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "project_variations",
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

    await queryInterface.addConstraint("project_variation_details", {
      fields: ["project_variation_id"],
      type: "foreign key",
      name: "FK_project_variation_details_project_variation_id",
      references: {
        table: "project_variations",
        field: "id",
      },
    });

    await queryInterface.addConstraint("project_variation_details", {
      fields: ["model_id"],
      type: "foreign key",
      name: "FK_project_variation_details_model_id",
      references: {
        table: "models",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("project_variation_details", "FK_project_variation_details_project_variation_id");
    await queryInterface.removeConstraint("project_variation_details", "FK_project_variation_details_model_id");
    await queryInterface.dropTable("project_variation_details");
  },
};
