"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("model_materials", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      allow_change: {
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

    await queryInterface.addConstraint("model_materials", {
      fields: ["model_id"],
      type: "foreign key",
      name: "FK_model_materials_model_id",
      references: {
        table: "models",
        field: "id",
      },
    });
    await queryInterface.addConstraint("model_materials", {
      fields: ["material_id"],
      type: "foreign key",
      name: "FK_model_materials_material_id",
      references: {
        table: "materials",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("model_materials", "FK_model_materials_model_id");
    await queryInterface.removeConstraint("model_materials", "FK_model_materials_material_id");
    await queryInterface.dropTable("model_materials");
  },
};
