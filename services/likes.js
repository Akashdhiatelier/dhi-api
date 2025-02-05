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

const checkModel = async (modelId) => {
  const model = await OPERATIONS.findOne(db.models, {
    where: {
      [Op.and]: [{ id: { [Op.eq]: modelId } }, { status: { [Op.eq]: "Active" } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  });
  if (!model) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No Models Found");
  }
};

const getAllProjectLikes = async (projectId) => {
  try {
    await checkProject(projectId);
    const getAllLikes = await OPERATIONS.findAll(db.projects_likes, {
      where: { project_id: projectId, is_liked: true },
    });

    return {
      likes: getAllLikes.length,
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const getAllModelLikes = async (modelId) => {
  try {
    await checkModel(modelId);
    const getAllLikes = await OPERATIONS.findAll(db.model_likes, {
      where: { model_id: modelId, is_liked: true },
    });

    return {
      likes: getAllLikes.length,
    };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

module.exports = { getAllProjectLikes, getAllModelLikes };
