"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("model_variation_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      model_variations_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "model_variations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "materials",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      layer_id: {
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

    await queryInterface.addConstraint("model_variation_details", {
      fields: ["model_variations_id"],
      type: "foreign key",
      name: "FK_model_variation_details_model_variations_id",
      references: {
        table: "model_variations",
        field: "id",
      },
    });

    await queryInterface.addConstraint("model_variation_details", {
      fields: ["material_id"],
      type: "foreign key",
      name: "FK_model_variation_details_material_id",
      references: {
        table: "materials",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("model_variation_details", "FK_model_variation_details_model_variations_id");
    await queryInterface.removeConstraint("model_variation_details", "FK_model_variation_details_material_id");
    await queryInterface.dropTable("model_variation_details");
  },
};
