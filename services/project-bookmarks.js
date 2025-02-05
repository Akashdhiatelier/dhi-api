const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");
const db = require("../models");

const checkProject = async (projectId) => {
  const project = await OPERATIONS.findOne(db.projects, {
    where: {
      [Op.and]: [{ id: { [Op.eq]: projectId } }, { status: { [Op.eq]: "Active" } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  });
  if (!project) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No Projects Found");
  }
};
const getAllProjectBookmarks = async (projectId) => {
  await checkProject(projectId);
  const getAllBookmarks = await OPERATIONS.findAll(db.projects_bookmarks, {
    where: { project_id: projectId, bookmarked: true },
  });

  return {
    bookmarks: getAllBookmarks.length,
  };
};

module.exports = { getAllProjectBookmarks };
