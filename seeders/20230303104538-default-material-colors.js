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
    return queryInterface.bulkInsert("material_colors", [
      {
        user_id: 1,
        name: "Pure Black",
        slug: "pureblack",
        color: "#000000",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        name: "Golden",
        slug: "golden",
        color: "#D7B84B",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        name: "Chienese Black",
        slug: "chieneseblack",
        color: "#3D3D3D",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        name: "Sky Blue",
        slug: "skyblue",
        color: "#029BD9",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        name: "Dark Gray",
        slug: "darkgray",
        color: "#4B4B4B",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        name: "White",
        slug: "white",
        color: "#FFFFFF",
        is_deleted: 0,
        deleted_at: null,
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
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
    return queryInterface.bulkDelete("material_colors", null, {});
  },
};
