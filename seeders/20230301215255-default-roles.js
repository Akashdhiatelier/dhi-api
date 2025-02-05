"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    return queryInterface.bulkInsert("roles", [
      {
        name: "Superadmin",
        slug: "superadmin",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Admin",
        slug: "admin",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("roles", null, {});
  },
};
