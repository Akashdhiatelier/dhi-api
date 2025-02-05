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
    return queryInterface.bulkInsert("users", [
      {
        role_id: 1,
        first_name: "DHI",
        last_name: "Admin",
        email: "dhiadmin@mailinator.com",
        password: "$2a$12$91u.70gXJbyAWUWcX8AfSOo.fY1d9KQSSLgGfjBVeL/2t3jCYGsvS",
        status: 1,
        is_verified: 1,
        is_deleted: 0,
        verified_at: new Date(),
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
    return queryInterface.bulkDelete("users", null, {});
  },
};
