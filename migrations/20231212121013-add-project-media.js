"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("projects", "media", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
      after: "project_file",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("projects", "media");
  },
};
