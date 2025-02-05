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
    return queryInterface.bulkInsert("modules", [
      {
        name: "Dashboard",
        slug: "dashboard",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Users",
        slug: "users",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Categories",
        slug: "categories",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Materials",
        slug: "materials",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Models",
        slug: "models",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Projects",
        slug: "projects",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Role & Permission",
        slug: "role-permission",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "My Profile",
        slug: "my-profile",
        status: 1,
        is_deleted: 0,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 1,
      },
      {
        name: "Settings",
        slug: "settings",
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
    return queryInterface.bulkDelete("modules", null, {});
  },
};
