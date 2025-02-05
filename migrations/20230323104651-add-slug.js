"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "roles",
          "slug",
          {
            type: Sequelize.STRING,
            after: "name",
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "material_colors",
          "slug",
          {
            type: Sequelize.STRING,
            after: "name",
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "materials",
          "slug",
          {
            type: Sequelize.STRING,
            after: "name",
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "categories",
          "slug",
          {
            type: Sequelize.STRING,
            after: "name",
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "models",
          "slug",
          {
            type: Sequelize.STRING,
            after: "name",
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("roles", "slug", { transaction: t }),
        queryInterface.removeColumn("material_colors", "slug", { transaction: t }),
        queryInterface.removeColumn("materials", "slug", { transaction: t }),
        queryInterface.removeColumn("categories", "slug", { transaction: t }),
        queryInterface.removeColumn("models", "slug", { transaction: t }),
      ]);
    });
  },
};
