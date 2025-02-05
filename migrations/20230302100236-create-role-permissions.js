"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_permissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "modules",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      write: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["Active", "Inactive", "Draft"],
        defaultValue: "Active",
      },
      is_deleted: {
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.INTEGER,
      },
      deleted_by: {
        type: Sequelize.INTEGER,
      },
    });

    await queryInterface.addConstraint("role_permissions", {
      fields: ["role_id"],
      type: "foreign key",
      name: "FK_role_permissions_role_id",
      references: {
        table: "roles",
        field: "id",
      },
    });

    await queryInterface.addConstraint("role_permissions", {
      fields: ["module_id"],
      type: "foreign key",
      name: "FK_role_permissions_module_id",
      references: {
        table: "modules",
        field: "id",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("role_permissions", "FK_role_permissions_role_id");
    await queryInterface.removeConstraint("role_permissions", "FK_role_permissions_module_id");
    await queryInterface.dropTable("role_permissions");
  },
};
