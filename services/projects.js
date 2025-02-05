const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const { getPaginatedData, slugifyString, unlinkFile, isNumber } = require("../utils/common");

const CustomError = require("../utils/customError");
const OPERATIONS = require("../repository/operations");
const db = require("../models");
const catchAsync = require("../utils/catchAsync");

const getAllProjects = async (body, userId) => {
  const { _page: offset, _limit: limit, _sort, _order, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [
        { is_deleted: { [Op.eq]: false } },
        { user_id: { [Op.eq]: userId } },
        status === "All" ? {} : { status: { [Op.eq]: status } },
      ],
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    include: [
      {
        model: db.project_models,
        as: "models",
        attributes: ["id", "object_id", "allow_change", "allow_move"],
        include: [
          {
            model: db.models,
            attributes: ["id", "name", "thumbnail", "model_file"],
          },
        ],
      },
    ],
    attributes: ["id", "name", "description", "tags", "price", "status", "thumbnail", "project_file", "camera_views"],
  };

  const getPanigated = await getPaginatedData(db.projects, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};

const getAllPublicProjects = async (body) => {
  const { _page: offset, _limit: limit, _sort, _order, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [{ is_deleted: { [Op.eq]: false } }, status === "All" ? {} : { status: { [Op.eq]: status } }],
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    attributes: ["id", "name", "description", "tags", "price", "status", "thumbnail", "project_file", "camera_views"],
  };

  console.log("query", query);

  const getPanigated = await getPaginatedData(db.projects, offset, limit, query);
  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};

const getById = async (projectId, userId, roleId) => {
  const q = {
    where: {
      [Op.and]: [roleId === 1 ? {} : {}, { id: { [Op.eq]: projectId } }],
    },
    include: [
      {
        model: db.project_models,
        as: "models",
        attributes: ["id", "object_id", "allow_change", "allow_move"],
        include: [
          {
            model: db.models,
            attributes: ["id", "name", "thumbnail", "model_file"],
          },
        ],
      },
      {
        model: db.projects_likes,
        as: "projects_likes",
        attributes: ["is_liked"],
        where: {
          user_id: userId,
        },
        required: false,
      },
    ],
    attributes: [
      "id",
      "name",
      "description",
      "tags",
      "price",
      "status",
      "thumbnail",
      "project_file",
      "camera_views",
      "media",
    ],
  };

  const getProject = await OPERATIONS.findOne(db.projects, q);
  if (!getProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No Projects Found");
  }

  const variationQuery = {
    where: { project_id: { [Op.eq]: projectId } },
    include: [
      {
        model: db.project_variation_details,
        as: "project_variation_details",
        attributes: ["id", "model_id", "object_id"],
        include: [
          {
            model: db.models,
            attributes: ["model_file"],
          },
        ],
      },
    ],
    attributes: ["id", "name", "price", "positions", "thumbnail"],
  };
  const getVariations = await OPERATIONS.findAll(db.project_variations, variationQuery);
  const parseCameraViews = getProject.dataValues.camera_views && JSON.parse(getProject.dataValues.camera_views);

  const isLiked = getProject.dataValues.projects_likes.length > 0 ? getProject.dataValues.projects_likes[0].is_liked : false;

  delete getProject.dataValues.projects_likes;

  const dataToShow = {
    ...getProject.dataValues,
    is_liked: isLiked,
    variation: getVariations,
    camera_views: parseCameraViews,
  };
  return dataToShow;
};

const getByIdPublic = async (projectId) => {
  const q = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: projectId } }, { is_deleted: 0 }],
    },
    include: [
      {
        model: db.project_models,
        as: "models",
        attributes: ["id", "object_id", "allow_change", "allow_move"],
        include: [
          {
            model: db.models,
            attributes: ["id", "name", "thumbnail", "model_file"],
          },
        ],
      },
    ],
    attributes: [
      "id",
      "name",
      "description",
      "tags",
      "price",
      "status",
      "thumbnail",
      "media",
      "project_file",
      "camera_views",
      "media",
    ],
  };

  const getProject = await OPERATIONS.findOne(db.projects, q);
  if (!getProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "No Projects Found");
  }

  const variationQuery = {
    where: { project_id: { [Op.eq]: projectId } },
    include: [
      {
        model: db.project_variation_details,
        as: "project_variation_details",
        attributes: ["id", "model_id", "object_id"],
        include: [
          {
            model: db.models,
            attributes: ["model_file"],
          },
        ],
      },
    ],
    attributes: ["id", "name", "price", "positions", "thumbnail"],
  };
  const getVariations = await OPERATIONS.findAll(db.project_variations, variationQuery);
  const parseCameraViews = getProject.dataValues.camera_views && JSON.parse(getProject.dataValues.camera_views);

  const dataToShow = {
    ...getProject.dataValues,
    variation: getVariations,
    camera_views: parseCameraViews,
  };
  return dataToShow;
};

const deleteById = async (projectId, userId, roleId) => {
  const query = {
    where: {
      [Op.and]: [
        { id: { [Op.eq]: projectId } },
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };
  const checkProject = await OPERATIONS.findOne(db.projects, query);
  if (!checkProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Project is not exists!");
  }

  if (checkProject.is_deleted) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Project already deleted");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const deleteProjectById = await OPERATIONS.updateById(db.projects, projectId, paramsToUpdate);
  if (!deleteProjectById) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return deleteProjectById;
};

const addProject = async (body, userId, req) => {
  const { name, description, tags, price, status } = body;

  const slug = slugifyString(name);

  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.projects, q);
  if (checkDuplicate) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.CONFLICT, "Project already exists");
  }

  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();
  let errorMessage = "";

  try {
    const reducedTags =
      tags &&
      tags.length > 0 &&
      tags.reduce((p, c) => {
        p.push(c.value);
        return p;
      }, []);

    const paramsToUpdate = {
      user_id: userId,
      name,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
      description,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      price,
      status,
      created_by: userId,
    };

    const createModel = await OPERATIONS.create(db.projects, paramsToUpdate, { transaction: t1 });

    if (!createModel) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
    }

    const checkIsNewData =
      tags &&
      tags.length > 0 &&
      tags.reduce((p, c) => {
        if (c.__isNew__) {
          p.push({
            name: c.value,
            slug: c.value.replaceAll(" ", "-").toLowerCase(),
          });
        }
        return p;
      }, []);

    const tagsQuery = {
      attributes: ["name"],
    };
    const getTags = await OPERATIONS.findAll(db.tags, tagsQuery);
    const getTagsIds = getTags.map((i) => i.name);
    const filteredData =
      checkIsNewData && checkIsNewData.length > 0 && checkIsNewData.filter((id) => !getTagsIds.includes(id.name));

    if (filteredData && filteredData.length > 0) {
      const createTags = await OPERATIONS.bulkCreate(db.tags, filteredData, { transaction: t2 });
      if (!createTags) {
        if (req.file) {
          unlinkFile(req);
        }
        errorMessage = "Problem occured!";
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
      }
    }

    const data = {
      id: createModel.id,
      name: createModel.name,
      thumbnail: createModel.thumbnail,
      description: createModel.description,
      tags: createModel.tags,
      price: createModel.price,
      status: createModel.status,
    };

    await t1.commit();
    await t2.commit();
    return data;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || error.toString() || "Error occured"
    );
  }
};

const updateProject = async (projectId, body, userId, roleId, req) => {
  if (!projectId) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(projectId)) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const { name, description, tags, price, status } = body;

  const slug = slugifyString(name);

  const q = {
    where: {
      [Op.and]: [
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        { id: { [Op.ne]: projectId } },
        { slug: { [Op.eq]: slug } },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.projects, q);
  if (checkDuplicate) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.CONFLICT, "Project already exists");
  }

  const checkProjectQuery = {
    where: {
      [Op.and]: [
        { id: { [Op.eq]: projectId } },
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };

  const checkProject = await OPERATIONS.findOne(db.projects, checkProjectQuery);

  if (!checkProject) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkProject.dataValues.thumbnail.split("/")[2] || "";
  }

  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();
  let errorMessage = "";

  try {
    const reducedTags =
      tags &&
      tags.length > 0 &&
      tags.reduce((p, c) => {
        p.push(c.value);
        return p;
      }, []);

    const paramsToUpdate = {
      name,
      slug,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : checkProject.dataValues.thumbnail,
      description,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      price,
      status,
      updated_by: userId,
    };

    const updateProjectById = await OPERATIONS.updateById(db.projects, checkProject.id, paramsToUpdate, { transaction: t1 });

    if (!updateProjectById) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
    }

    const checkIsNewData =
      tags &&
      tags.length > 0 &&
      tags.reduce((p, c) => {
        if (c.__isNew__) {
          p.push({
            name: c.value,
            slug: c.value.replaceAll(" ", "-").toLowerCase(),
          });
        }
        return p;
      }, []);

    const tagsQuery = {
      attributes: ["name"],
    };
    const getTags = await OPERATIONS.findAll(db.tags, tagsQuery);
    const getTagsIds = getTags.map((i) => i.name);
    const filteredData =
      checkIsNewData && checkIsNewData.length > 0 && checkIsNewData.filter((id) => !getTagsIds.includes(id.name));

    if (filteredData && filteredData.length > 0) {
      const createTags = await OPERATIONS.bulkCreate(db.tags, filteredData, { transaction: t2 });
      if (!createTags) {
        if (req.file) {
          unlinkFile(req);
        }
        errorMessage = "Problem occured!";
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
      }
    }

    if (fileToDelete) {
      fs.access(`public/thumbnails/${fileToDelete}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`File does not exist.`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.unlink(`public/thumbnails/${fileToDelete}`, (errr) => {
            if (errr) {
              throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
            }
          });
        }
      });
    }

    const data = {
      id: updateProjectById.id,
      name: updateProjectById.name,
      thumbnail: updateProjectById.thumbnail,
      description: updateProjectById.description,
      tags: updateProjectById.tags,
      price: updateProjectById.price,
      status: updateProjectById.status,
    };
    await t1.commit();
    await t2.commit();
    return data;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || error.toString() || "Error occured"
    );
  }
};

const uploadProject = async (projectId, userId, roleId, req) => {
  const deleteFile = (filename) => {
    fs.access(`public/projects/${filename}`, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File does not exist.`);
      } else {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlink(`public/projects/${filename}`, (errr) => {
          if (errr) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
          }
        });
      }
    });
  };

  if (!projectId) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(projectId)) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [
        { id: { [Op.eq]: projectId } },
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };

  const checkProject = await OPERATIONS.findOne(db.projects, query);

  if (!checkProject) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkProject.dataValues.project_file;
  }

  const paramsToUpdate = {
    project_file: req.file ? `public/projects/${req.file.filename}` : "",
    updated_by: userId,
  };

  const updateQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: checkProject.id } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const updateProjectFile = await OPERATIONS.update(db.projects, paramsToUpdate, updateQuery);

  if (!updateProjectFile) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  if (fileToDelete) {
    deleteFile(fileToDelete.split("/").pop());
  }

  return updateProjectFile;
};

const multiUpdate = async (body, userId, roleId) => {
  const { project_ids: projectIds, status } = body;

  const modelQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getProjects = await OPERATIONS.findAll(db.projects, modelQuery);
  const getProjectIds = getProjects.map((i) => i.id);
  const invalidIds = projectIds.filter((id) => !getProjectIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Project Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.projects.update(
      dataToUpdate,
      { where: { id: { [Op.in]: projectIds } } },
      { transaction: t }
    );
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating projects";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating projects");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || error.toString() || "Error occured while updating projects"
    );
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { project_ids: projectIds } = body;

  const modelQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getProjects = await OPERATIONS.findAll(db.models, modelQuery);
  const getProjectIds = getProjects.map((i) => i.id);
  const invalidIds = projectIds.filter((id) => !getProjectIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Project Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.projects.update(
      dataToUpdate,
      { where: { id: { [Op.in]: projectIds } } },
      { transaction: t }
    );
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting projects";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting projects");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || "Error occured while deleting projects"
    );
  }
  return true;
};

const updateProjectConfig = async (body, projectId, userId) => {
  const { config } = body;
  if (!projectId) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(projectId)) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkProject = await OPERATIONS.findOne(db.projects, query);

  if (!checkProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Project not exists!");
  }

  const ids = config.map((i) => i.model_id);
  const modelQuery = {
    attributes: ["id"],
  };
  const getModels = await OPERATIONS.findAll(db.models, modelQuery);
  const getModelIds = getModels.map((i) => i.id);
  const invalidIds = ids.filter((id) => !getModelIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Model Ids ${invalidIds.toString()} are invalid!`);
  }

  let errorMessage = "";
  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();

  try {
    const deleteQuery = {
      where: {
        project_id: { [Op.eq]: projectId },
      },
    };
    await db.project_models.destroy(deleteQuery, { transaction: t1 });

    const refinedData = config.map((item) => {
      const data = {
        project_id: checkProject.id,
        model_id: item.model_id,
        object_id: item.object_id,
        allow_change: item.allow_change,
        allow_move: item.allow_move,
      };
      return data;
    });
    const createConfig = await OPERATIONS.bulkCreate(db.project_models, refinedData, { transaction: t2 });

    if (!createConfig) {
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }
    await t1.commit();
    await t2.commit();
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || "Error occured while updating config"
    );
  }

  return true;
};

const createVariation = async (body, projectId, userId, req) => {
  if (!projectId) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(projectId)) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [
        { id: { [Op.eq]: projectId } },
        { is_deleted: { [Op.eq]: false } },
        userId === 1 ? {} : { userId: { [Op.eq]: userId } },
      ],
    },
  };

  const checkProject = await OPERATIONS.findOne(db.projects, query);
  if (!checkProject) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Project not found");
  }

  const { name, price, positions } = body;
  let variation;
  try {
    variation = JSON.parse(body.variation);
  } catch (error) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
  }

  const ids = variation && variation.length > 0 && variation.map((i) => i.model_id);
  const modelQuery = {
    attributes: ["id"],
  };
  const getModels = await OPERATIONS.findAll(db.models, modelQuery);
  const getModelIds = getModels.map((i) => i.id);
  const invalidIds = ids.filter((id) => !getModelIds.includes(id));
  if (invalidIds.length > 0) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, `Model Ids ${invalidIds.toString()} are invalid!`);
  }

  const q = {
    limit: 1,
    where: {
      project_id: { [Op.eq]: projectId },
    },
    attributes: ["name"],
    order: [["id", "DESC"]],
  };
  const findLastRec = await OPERATIONS.findOne(db.project_variations, q);

  const defineCount = findLastRec && findLastRec.dataValues.name ? findLastRec.dataValues.name.split("-")[1] : 0;
  const variationName =
    name || (defineCount ? `${findLastRec.dataValues.name.split("-")[0]}-${Number(defineCount) + 1}` : "variation-1");
  const dataToCreate = {
    project_id: projectId,
    name: variationName,
    price,
    positions,
    thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
  };

  const createNewVariation = await OPERATIONS.create(db.project_variations, dataToCreate);

  if (!createNewVariation) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  const refinedData =
    (variation &&
      variation.length > 0 &&
      variation.map((item) => {
        const data = {
          project_variation_id: createNewVariation.dataValues.id,
          model_id: item.model_id,
          object_id: item.object_id,
        };
        return data;
      })) ||
    [];

  let errorMessage = "";
  const t1 = await db.sequelize.transaction();

  try {
    const createDetails = await OPERATIONS.bulkCreate(db.project_variation_details, refinedData, { transaction: t1 });
    const refinedVariation = createDetails.reduce((p, c) => {
      p.push({
        id: c.dataValues.id,
        model_id: c.dataValues.model_id,
        object_id: c.dataValues.object_id,
      });
      return p;
    }, []);
    if (!createDetails) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }
    await t1.commit();
    const data = {
      id: createNewVariation.dataValues.id,
      name: createNewVariation.dataValues.name,
      project_id: projectId,
      price: createNewVariation.dataValues.price,
      thumbnail: createNewVariation.dataValues.thumbnail,
      positions: createNewVariation.dataValues.positions,
      variation: refinedVariation,
    };
    return data;
  } catch (error) {
    await t1.rollback();
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || "Error occured while updating config"
    );
  }
};

const updateVariation = async (body, userId, req) => {
  const { id, name, price, positions } = body;

  const query = {
    where: {
      id: { [Op.eq]: id },
    },
  };

  const checkProject = await OPERATIONS.findOne(db.project_variations, query);
  if (!checkProject) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Variation not found");
  }

  let variation;
  try {
    variation = JSON.parse(body.variation);
  } catch (error) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
  }

  const ids = variation && variation.length > 0 && variation.map((i) => i.id);
  const Idq = {
    attributes: ["id"],
  };
  const getVariations = await OPERATIONS.findAll(db.project_variation_details, Idq);
  const getVariationIds = getVariations.map((i) => i.id);
  const invalidIds = ids.filter((i) => !getVariationIds.includes(i));
  if (invalidIds.length > 0) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, `Variation Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  const t1 = await db.sequelize.transaction();

  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkProject.thumbnail;
  }

  try {
    const updateObj = {
      name,
      price,
      positions,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
    };

    const updateVariationName = await OPERATIONS.updateById(db.project_variations, id, updateObj, { transaction: t1 });
    if (!updateVariationName) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }

    const statements = [];

    for (let i = 0; i < variation.length; i += 1) {
      statements.push(
        db.project_variation_details.update(
          {
            model_id: variation[i].model_id,
            object_id: variation[i].object_id,
          },
          { where: { id: { [Op.eq]: variation[i].id } } },
          { transaction: t }
        )
      );
    }
    const result = Promise.all(statements)
      .then((res) => {
        t.commit();
        return true;
      })
      .catch((err) => {
        if (req.file) {
          unlinkFile(req);
        }
        t.rollback();
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, err);
      });

    if (fileToDelete) {
      fs.access(fileToDelete, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`File does not exist.`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.unlink(fileToDelete, (errr) => {
            if (errr) {
              throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
            }
          });
        }
      });
    }

    await t1.commit();
    return {
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
    };
  } catch (error) {
    await t1.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
  }
};

const deleteVariation = async (variationId) => {
  const checkProject = await OPERATIONS.findById(db.project_variations, variationId);
  if (!checkProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Variation doesn't exists!");
  }
  const query = {
    where: { project_variation_id: { [Op.eq]: variationId } },
  };
  await db.project_variation_details.destroy(query);

  const deleteVariationById = await OPERATIONS.deleteById(db.project_variations, variationId);
  if (!deleteVariationById) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return true;
};

const saveCameraView = async (projectId, userId, body) => {
  const { cameraViews } = body;

  if (!projectId) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(projectId)) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkProject = await OPERATIONS.findOne(db.projects, query);

  if (!checkProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Project not exists!");
  }

  const projectsCameraViews = JSON.parse(checkProject.camera_views);

  let dataCameraView = [];
  if (projectsCameraViews === null || projectsCameraViews.length === 0) {
    dataCameraView.push(cameraViews);
  } else {
    dataCameraView = [...projectsCameraViews];
    dataCameraView.push(cameraViews);
  }

  const obj = {
    camera_views: JSON.stringify(dataCameraView),
  };

  const updateQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: checkProject.id } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  await OPERATIONS.update(db.projects, obj, updateQuery);

  const updatedProject = await OPERATIONS.findOne(db.projects, query);

  if (!updatedProject) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Updated project not found!");
  }

  const ParseCameraViews = JSON.parse(updatedProject.dataValues.camera_views);

  const dataToShow = {
    ...updatedProject.dataValues,
    camera_views: ParseCameraViews,
  };
  return dataToShow;
};

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
  return project;
};

const checkProjectLike = async (projectId, userId) => {
  try {
    const checkLike = await OPERATIONS.findOne(db.projects_likes, {
      where: {
        [Op.and]: [{ project_id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }],
      },
    });
    if (!checkLike) {
      return false;
    }
    return true;
  } catch (error) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const likeProject = async (projectId, userId, likeStatus) => {
  try {
    await checkProject(projectId);
    const isLikeExist = await checkProjectLike(projectId, userId);
    if (isLikeExist) {
      await OPERATIONS.update(
        db.projects_likes,
        {
          is_liked: likeStatus,
        },
        {
          where: {
            [Op.and]: [{ project_id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }],
          },
        }
      );
      return true;
    }

    const createLike = await OPERATIONS.create(db.projects_likes, {
      project_id: projectId,
      user_id: userId,
      is_liked: likeStatus,
    });

    if (!createLike) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Unable to like project");
    }
    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const checkProjectBookmark = async (projectId, userId) => {
  try {
    const checkBookmark = await OPERATIONS.findOne(db.projects_bookmarks, {
      where: {
        [Op.and]: [{ project_id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }],
      },
    });
    if (!checkBookmark) {
      return false;
    }
    return true;
  } catch (error) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const saveProject = async (projectId, userId, bookmarkStatus) => {
  try {
    await checkProject(projectId);
    const isBookmarkExist = await checkProjectBookmark(projectId, userId);
    if (isBookmarkExist) {
      await OPERATIONS.update(
        db.projects_bookmarks,
        {
          bookmarked: bookmarkStatus,
        },
        {
          where: {
            [Op.and]: [{ project_id: { [Op.eq]: projectId } }, { user_id: { [Op.eq]: userId } }],
          },
        }
      );
      return true;
    }

    const createBookmark = await OPERATIONS.create(db.projects_bookmarks, {
      project_id: projectId,
      user_id: userId,
      bookmarked: bookmarkStatus,
    });

    if (!createBookmark) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Unable to bookmark project");
    }
    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const addProjectMedia = async (projectId, req) => {
  try {
    if (!projectId) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
    }

    if (!isNumber(projectId)) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
    }
    await checkProject(projectId);
    let media = "";
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => file.path);
    }

    await OPERATIONS.update(
      db.projects,
      {
        media: media ? JSON.stringify(media) : "",
      },
      { where: { id: projectId } }
    );

    return true;
  } catch (error) {
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fs.access(`public/uploads/${file.filename}`, fs.constants.F_OK, (err) => {
          if (err) {
            console.log(`File does not exist.`);
          } else {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.unlink(`public/uploads/${file.filename}`, (errr) => {
              if (errr) {
                throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errr);
              }
            });
          }
        });
      });
    }
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const unlinkMedia = catchAsync((media) => {
  fs.access(media, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(media, (error) => {
        if (error) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
      });
    }
  });
});

const deleteProjectMedia = async (projectId, media, res) => {
  try {
    const project = await OPERATIONS.findOne(db.projects, {
      where: {
        [Op.and]: [{ id: { [Op.eq]: projectId } }, { status: { [Op.eq]: "Active" } }, { is_deleted: { [Op.eq]: false } }],
      },
      attributes: ["id", "media"],
    });
    if (!project) {
      throw new CustomError(StatusCodes.NOT_FOUND, "No Projects Found");
    }

    let projectMedia;

    if (!project.media) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Project media not found");
    }

    projectMedia = JSON.parse(project.media);

    if (!projectMedia.includes(media)) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Project media not found");
    }

    projectMedia = projectMedia.filter((i) => i !== media);

    const checkNull = JSON.stringify(projectMedia) === "[]" ? null : JSON.stringify(projectMedia);

    const updatedProject = await OPERATIONS.updateById(db.projects, projectId, {
      media: checkNull,
    });

    if (!updatedProject) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    unlinkMedia(media);

    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const getProjectComments = async (projectId) => {
  try {
    await checkProject(projectId);

    const getComments = await OPERATIONS.findAll(db.projects_comments, {
      where: {
        project_id: { [Op.eq]: projectId },
      },
      include: [
        {
          model: db.users,
          attributes: ["first_name", "last_name", "avatar_url"],
          where: {
            status: "Active",
            is_deleted: false,
          },
        },
      ],
      attributes: ["comments", "created_at"],
    });

    if (!getComments) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    return getComments;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const addProjectComment = async (projectId, userId, body) => {
  try {
    if (!projectId) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
    }

    if (!isNumber(projectId)) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
    }

    await checkProject(projectId);

    const addComment = await OPERATIONS.create(db.projects_comments, {
      project_id: projectId,
      user_id: userId,
      comments: body.comment,
    });

    if (!addComment) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    return true;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const getAllLikedProject = async (body, userId) => {
  try {
    const { _page: offset, _limit: limit, _sort, _order, q: searchTerm = "" } = body;

    const query = {
      where: {
        [Op.and]: [
          {
            user_id: userId,
            is_liked: true,
          },
        ],
      },
      order: [[_sort, _order.toUpperCase()]],
      include: [
        {
          model: db.projects,
          where: {
            [Op.and]: [{ status: { [Op.eq]: "Active" } }, { is_deleted: { [Op.eq]: false } }],
            [Op.or]: [
              { name: { [Op.like]: `%${searchTerm}%` } },
              { tags: { [Op.like]: `%${searchTerm}%` } },
              { description: { [Op.like]: `%${searchTerm}%` } },
              { price: { [Op.like]: `%${searchTerm}%` } },
            ],
          },
          attributes: ["id", "name", "description", "tags", "price", "media", "thumbnail", "project_file", "camera_views"],
        },
      ],
      attributes: ["project_id"],
    };

    const getPanigated = await getPaginatedData(db.projects_likes, offset, limit, query);

    if (!getPanigated) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }

    let data = [];
    if (getPanigated.data && getPanigated.data.length > 0)
      data = getPanigated.data.map((i) => {
        const project = i.dataValues;
        delete project.project_id;
        return project.project.dataValues;
      });

    return { ...getPanigated, data };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

module.exports = {
  getAllProjects,
  getById,
  deleteById,
  addProject,
  updateProject,
  uploadProject,
  multiUpdate,
  multiDelete,
  updateProjectConfig,
  createVariation,
  updateVariation,
  deleteVariation,
  saveCameraView,
  getAllPublicProjects,
  getByIdPublic,
  likeProject,
  saveProject,
  addProjectMedia,
  deleteProjectMedia,
  getProjectComments,
  addProjectComment,
  getAllLikedProject,
};
