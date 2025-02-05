"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "model_variations",
          "thumbnail",
          {
            type: Sequelize.STRING,
            after: "price",
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.add([queryInterface.removeColumn("model_variations", "thumbnail", { transaction: t })]);
    });
  },
};
