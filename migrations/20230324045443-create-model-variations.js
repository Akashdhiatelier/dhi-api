"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("model_variations", {
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
      name: {
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

    await queryInterface.addConstraint("model_variations", {
      fields: ["model_id"],
      type: "foreign key",
      name: "FK_model_variations_model_id",
      references: {
        table: "models",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("model_variations", "FK_model_variations_model_id");
    await queryInterface.dropTable("model_variations");
  },
};
