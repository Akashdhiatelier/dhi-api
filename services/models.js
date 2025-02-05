const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const _ = require("lodash");

const OPERATIONS = require("../repository/operations");
const CustomError = require("../utils/customError");
const { unlinkFile, isNumber, getPaginatedData, slugifyString } = require("../utils/common");

const db = require("../models");
const catchAsync = require("../utils/catchAsync");

const addModel = async (body, userId, req) => {
  const { category, name, description, tags, vendor_name: vendorName, price, status } = body;
  const slug = slugifyString(name);

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: category } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkCategory = await OPERATIONS.findOne(db.categories, query);

  if (!checkCategory) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Category not exists!");
  }

  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.models, q);
  if (checkDuplicate) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.CONFLICT, "Model already exists");
  }

  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();
  let errorMessage = "";

  try {
    const pasrseTags = tags && JSON.parse(tags);

    const reducedTags =
      pasrseTags &&
      pasrseTags.length > 0 &&
      pasrseTags.reduce((p, c) => {
        p.push(c.value);
        return p;
      }, []);

    const paramsToUpdate = {
      user_id: userId,
      category_id: category,
      name,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
      description,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      vendor_name: vendorName,
      price,
      status,
      created_by: userId,
    };

    const createModel = await OPERATIONS.create(db.models, paramsToUpdate, { transaction: t1 });

    if (!createModel) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
    }

    const checkIsNewData =
      pasrseTags &&
      pasrseTags.length > 0 &&
      pasrseTags.reduce((p, c) => {
        if (c.__isNew__) {
          p.push({
            name: c.value,
            slug: c.value.replaceAll(" ", "-").toLowerCase(),
          });
        }
        return p;
      }, []);

    const materialQuery = {
      attributes: ["name"],
    };
    const getTags = await OPERATIONS.findAll(db.tags, materialQuery);
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
      category: createModel.category_id,
      name: createModel.name,
      thumbnail: createModel.thumbnail,
      description: createModel.description,
      tags: createModel.tags,
      vendor_name: createModel.vendor_name,
      price: createModel.price,
      status: createModel.status,
    };

    await t1.commit();
    await t2.commit();
    return data;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || error.errorMessage || "Error occured");
  }
};

const updateModel = async (body, modelId, userId, req) => {
  if (!modelId) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(modelId)) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const { category, name, description, tags, vendor_name: vendorName, price, status } = body;

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: category } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkCategory = await OPERATIONS.findOne(db.categories, query);

  if (!checkCategory) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  const slug = slugifyString(name);

  const q = {
    where: {
      [Op.and]: [{ id: { [Op.ne]: modelId } }, { slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.models, q);
  if (checkDuplicate) {
    throw new CustomError(StatusCodes.CONFLICT, "Model already exists");
  }

  const checkModelQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkModel = await OPERATIONS.findOne(db.models, checkModelQuery);

  if (!checkModel) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkModel.dataValues.thumbnail.split("/")[2] || "";
  }

  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();
  let errorMessage = "";

  try {
    const pasrseTags = tags && JSON.parse(tags);

    const reducedTags =
      pasrseTags &&
      pasrseTags.length > 0 &&
      pasrseTags.reduce((p, c) => {
        p.push(c.value);
        return p;
      }, []);

    const paramsToUpdate = {
      category_id: category,
      name,
      slug,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : checkModel.dataValues.thumbnail,
      description,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      vendor_name: vendorName,
      price,
      status,
      updated_by: userId,
    };

    const updateModelById = await OPERATIONS.updateById(db.models, checkModel.id, paramsToUpdate, { transaction: t1 });

    if (!updateModelById) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
    }

    const checkIsNewData =
      pasrseTags &&
      pasrseTags.length > 0 &&
      pasrseTags.reduce((p, c) => {
        if (c.__isNew__) {
          p.push({
            name: c.value,
            slug: c.value.replaceAll(" ", "-").toLowerCase(),
          });
        }
        return p;
      }, []);

    const materialQuery = {
      attributes: ["name"],
    };
    const getTags = await OPERATIONS.findAll(db.tags, materialQuery);
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
      fs.access(`public/uploads/${fileToDelete}`, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`File does not exist.`);
        } else {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.unlink(`public/uploads/${fileToDelete}`, (error) => {
            if (error) {
              throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
            }
          });
        }
      });
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
      id: updateModelById.id,
      category: updateModelById.category_id,
      name: updateModelById.name,
      thumbnail: updateModelById.thumbnail,
      description: updateModelById.description,
      tags: updateModelById.tags,
      vendor_name: updateModelById.vendor_name,
      price: updateModelById.price,
      status: updateModelById.status,
    };
    await t1.commit();
    await t2.commit();
    return data;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || error.errorMessage || "Error occured");
  }
};

const getAllModels = async (body, userId, roleId) => {
  const { _page: offset, _limit: limit, _sort, _order, category, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [
        { is_deleted: { [Op.eq]: false } },
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        status === "All" ? {} : { status: { [Op.eq]: status } },
      ],
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { vendor_name: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    include: [
      {
        model: db.categories,
        where: {
          [Op.and]: [category === "All" ? {} : { name: { [Op.eq]: category } }, { is_deleted: { [Op.eq]: false } }],
        },
        attributes: ["name"],
      },
    ],
    attributes: ["id", "name", "vendor_name", "tags", "price", "status", "thumbnail", "model_file"],
  };

  const getPanigated = await getPaginatedData(db.models, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};
const getAllPublicModels = async (body) => {
  const { _page: offset, _limit: limit, _sort, _order, category, status, q: searchTerm = "" } = body;

  const query = {
    where: {
      [Op.and]: [{ is_deleted: { [Op.eq]: false } }, status === "All" ? {} : { status: { [Op.eq]: status } }],
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { vendor_name: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    include: [
      {
        model: db.categories,
        where: {
          [Op.and]: [category === "All" ? {} : { name: { [Op.eq]: category } }, { is_deleted: { [Op.eq]: false } }],
        },
        attributes: ["name"],
      },
    ],
    attributes: ["id", "name", "vendor_name", "tags", "price", "status", "thumbnail", "model_file"],
  };

  const getPanigated = await getPaginatedData(db.models, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};

const getAllWithSearch = async (body, userId, roleId) => {
  const { q: searchTerm = "" } = body;
  const q = {
    where: {
      [Op.and]: [
        { is_deleted: { [Op.eq]: false } },
        roleId === 1 ? {} : { user_id: { [Op.eq]: userId } },
        { status: { [Op.eq]: "Active" } },
      ],
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { vendor_name: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [["id", "DESC"]],
    attributes: ["id", "name", "thumbnail"],
  };

  const getAll = await OPERATIONS.findAll(db.models, q);

  if (!getAll) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getAll;
};

const getById = async (id, userId, roleId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: id } }, roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }],
    },
    include: [
      {
        model: db.categories,
        where: { is_deleted: { [Op.eq]: false } },
        attributes: ["id", "name"],
      },
    ],
    attributes: ["id", "name", "thumbnail", "description", "vendor_name", "price", "tags", "model_file", "status"],
  };

  const q = {
    where: { model_id: { [Op.eq]: id } },
    include: [
      {
        model: db.materials,
        where: {
          is_deleted: false,
        },
        attributes: ["id", "name", "price", "thumbnail"],
      },
    ],
    attributes: ["layer_id", "allow_change"],
  };
  const getConfig = await OPERATIONS.findAll(db.model_materials, q);

  const group = _.chain(getConfig)
    .groupBy("layer_id")
    .map((value) => value)
    .value();
  const getModels = await OPERATIONS.findOne(db.models, query);
  if (!getModels) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  const variationQuery = {
    where: { model_id: { [Op.eq]: id } },
    include: [
      {
        model: db.model_variation_details,
        as: "details",
        attributes: ["id", "material_id", "layer_id"],
      },
    ],
    attributes: ["id", "name", "price", "thumbnail"],
  };
  const getVariations = await OPERATIONS.findAll(db.model_variations, variationQuery);

  const dataToShow = {
    ...getModels.dataValues,
    config: group && group.length > 0 ? group.flat() : [],
    variation: getVariations,
  };
  return dataToShow;
};
const getByIdPublic = async (id) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: id } }],
    },
    include: [
      {
        model: db.categories,
        where: { is_deleted: { [Op.eq]: false } },
        attributes: ["id", "name"],
      },
    ],
    attributes: ["id", "name", "thumbnail", "description", "vendor_name", "price", "tags", "model_file", "status"],
  };

  const q = {
    where: { model_id: { [Op.eq]: id } },
    include: [
      {
        model: db.materials,
        where: {
          is_deleted: false,
        },
        attributes: ["id", "name", "price", "thumbnail"],
      },
    ],
    attributes: ["layer_id", "allow_change"],
  };
  const getConfig = await OPERATIONS.findAll(db.model_materials, q);

  const group = _.chain(getConfig)
    .groupBy("layer_id")
    .map((value) => value)
    .value();
  const getModels = await OPERATIONS.findOne(db.models, query);
  if (!getModels) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }

  const variationQuery = {
    where: { model_id: { [Op.eq]: id } },
    include: [
      {
        model: db.model_variation_details,
        as: "details",
        attributes: ["id", "material_id", "layer_id"],
      },
    ],
    attributes: ["id", "name", "price", "thumbnail"],
  };
  const getVariations = await OPERATIONS.findAll(db.model_variations, variationQuery);
  // console.log("getVariations", getVariations);
  const dataToShow = {
    ...getModels.dataValues,
    config: group && group.length > 0 ? group.flat() : [],
    variation: getVariations,
  };
  return dataToShow;
};

const deleteModel = async (modelId, userId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const checkModel = await OPERATIONS.findOne(db.models, query);
  if (!checkModel) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Model is not exists!");
  }

  if (checkModel.is_deleted) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Model already deleted");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const deleteModelById = await OPERATIONS.updateById(db.models, modelId, paramsToUpdate);
  if (!deleteModelById) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return deleteModelById;
};

const unlinkModelFile = catchAsync((filename) => {
  fs.access(`public/models/${filename}`, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist.`);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlink(`public/models/${filename}`, (error) => {
        if (error) {
          throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
      });
    }
  });
});

const uploadGLB = async (modelId, userId, req) => {
  if (!modelId) {
    if (req.file) {
      unlinkModelFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(modelId)) {
    if (req.file) {
      unlinkModelFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkModel = await OPERATIONS.findOne(db.models, query);

  if (!checkModel) {
    if (req.file) {
      unlinkModelFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkModel.model_file;
  }

  const paramsToUpdate = {
    model_file: req.file ? `public/models/${req.file.filename}` : "",
    updated_by: userId,
  };

  const updateQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: checkModel.id } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const updateModelFile = await OPERATIONS.update(db.models, paramsToUpdate, updateQuery);

  if (!updateModelFile) {
    if (req.file) {
      unlinkModelFile(req.file.filename);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  if (fileToDelete) {
    unlinkModelFile(fileToDelete.split("/").pop());
  }

  return updateModelFile;
};

const updateConfig = async (body, modelId, userId) => {
  const { config } = body;
  if (!modelId) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(modelId)) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkModel = await OPERATIONS.findOne(db.models, query);

  if (!checkModel) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Model not exists!");
  }

  const ids = config.map((i) => i.material_id);
  const materialQuery = {
    attributes: ["id"],
  };
  const getMaterials = await OPERATIONS.findAll(db.materials, materialQuery);
  const getMaterialIds = getMaterials.map((i) => i.id);
  const invalidIds = ids.filter((id) => !getMaterialIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Material Ids ${invalidIds.toString()} are invalid!`);
  }

  let errorMessage = "";
  const t1 = await db.sequelize.transaction();
  const t2 = await db.sequelize.transaction();

  try {
    const deleteQuery = {
      where: {
        model_id: { [Op.eq]: modelId },
      },
    };
    await db.model_materials.destroy(deleteQuery, { transaction: t1 });

    const refinedData = config.map((item) => {
      const data = {
        model_id: checkModel.id,
        material_id: item.material_id,
        layer_id: item.layer_id,
        allow_change: item.allow_change,
      };
      return data;
    });
    const createMaterialConfig = await OPERATIONS.bulkCreate(db.model_materials, refinedData, { transaction: t2 });

    if (!createMaterialConfig) {
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

const multiUpdate = async (body, userId, roleId) => {
  const { model_ids: modelIds, status } = body;

  const modelQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getModels = await OPERATIONS.findAll(db.models, modelQuery);
  const getModelIds = getModels.map((i) => i.id);
  const invalidIds = modelIds.filter((id) => !getModelIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Model Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.models.update(dataToUpdate, { where: { id: { [Op.in]: modelIds } } }, { transaction: t });
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating models";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating models");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || "Error occured while updating models"
    );
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { model_ids: modelIds } = body;

  const modelQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getModels = await OPERATIONS.findAll(db.models, modelQuery);
  const getModelIds = getModels.map((i) => i.id);
  const invalidIds = modelIds.filter((id) => !getModelIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Model Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.models.update(dataToUpdate, { where: { id: { [Op.in]: modelIds } } }, { transaction: t });
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting models";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting models");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      errorMessage || error.errorMessage || "Error occured while deleting models"
    );
  }
  return true;
};

const createVariation = async (body, modelId, userId, req) => {
  if (!modelId) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(modelId)) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const query = {
    where: {
      [Op.and]: [
        { id: { [Op.eq]: modelId } },
        { is_deleted: { [Op.eq]: false } },
        userId === 1 ? {} : { userId: { [Op.eq]: userId } },
      ],
    },
  };

  const checkModel = await OPERATIONS.findOne(db.models, query);
  if (!checkModel) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Model not found");
  }

  const { name, price } = body;
  let variation;
  try {
    variation = JSON.parse(body.variation);
  } catch (error) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.toString());
  }

  const ids = variation && variation.length > 0 && variation.map((i) => i.material_id);
  const materialQuery = {
    attributes: ["id"],
  };
  const getMaterials = await OPERATIONS.findAll(db.materials, materialQuery);
  const getMaterialIds = getMaterials.map((i) => i.id);
  const invalidIds = ids.filter((id) => !getMaterialIds.includes(id));
  if (invalidIds.length > 0) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, `Material Ids ${invalidIds.toString()} are invalid!`);
  }

  const q = {
    limit: 1,
    where: {
      model_id: { [Op.eq]: modelId },
    },
    attributes: ["name"],
    order: [["id", "DESC"]],
  };
  const findLastRec = await OPERATIONS.findOne(db.model_variations, q);

  const defineCount = findLastRec && findLastRec.dataValues.name ? findLastRec.dataValues.name.split("-")[1] : 0;
  const variationName =
    name || (defineCount ? `${findLastRec.dataValues.name.split("-")[0]}-${Number(defineCount) + 1}` : "variation-1");
  const dataToCreate = {
    model_id: modelId,
    name: variationName,
    price,
    thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
  };

  const createNewVariation = await OPERATIONS.create(db.model_variations, dataToCreate);

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
          model_variations_id: createNewVariation.dataValues.id,
          material_id: item.material_id,
          layer_id: item.layer_id,
        };
        return data;
      })) ||
    [];

  let errorMessage = "";
  const t1 = await db.sequelize.transaction();

  try {
    const createDetails = await OPERATIONS.bulkCreate(db.model_variation_details, refinedData, { transaction: t1 });
    const refinedVariation = createDetails.reduce((p, c) => {
      p.push({
        id: c.dataValues.id,
        material_id: c.dataValues.material_id,
        layer_id: c.dataValues.layer_id,
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
      model_id: modelId,
      price: createNewVariation.dataValues.price,
      thumbnail: createNewVariation.dataValues.thumbnail,
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
  const { id, name, price } = body;

  const query = {
    where: {
      id: { [Op.eq]: id },
    },
  };

  const checkModel = await OPERATIONS.findOne(db.model_variations, query);
  if (!checkModel) {
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
  const getVariations = await OPERATIONS.findAll(db.model_variation_details, Idq);
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
    fileToDelete = checkModel.thumbnail;
  }

  try {
    const updateObj = {
      name,
      price,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : "",
    };

    const updateVariationName = await OPERATIONS.updateById(db.model_variations, id, updateObj, { transaction: t1 });
    if (!updateVariationName) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
    }

    const statements = [];

    for (let i = 0; i < variation.length; i += 1) {
      statements.push(
        db.model_variation_details.update(
          {
            material_id: variation[i].material_id,
            layer_id: variation[i].layer_id,
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
  const checkModel = await OPERATIONS.findById(db.model_variations, variationId);
  if (!checkModel) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Variation doesn't exists!");
  }
  const query = {
    where: { model_variations_id: { [Op.eq]: variationId } },
  };
  await db.model_variation_details.destroy(query);

  const deleteVariationById = await OPERATIONS.deleteById(db.model_variations, variationId);
  if (!deleteVariationById) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return true;
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

const checkModelLike = async (modelId, userId) => {
  try {
    const checkLike = await OPERATIONS.findOne(db.model_likes, {
      where: {
        [Op.and]: [{ model_id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }],
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

const likeModel = async (modelId, userId, likeStatus) => {
  try {
    await checkModel(modelId);
    const isLikeExist = await checkModelLike(modelId, userId);
    if (isLikeExist) {
      await OPERATIONS.update(
        db.model_likes,
        {
          is_liked: likeStatus,
        },
        {
          where: {
            [Op.and]: [{ model_id: { [Op.eq]: modelId } }, { user_id: { [Op.eq]: userId } }],
          },
        }
      );
      return true;
    }

    const createLike = await OPERATIONS.create(db.model_likes, {
      model_id: modelId,
      user_id: userId,
      is_liked: likeStatus,
    });

    if (!createLike) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Unable to like model");
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

module.exports = {
  addModel,
  updateModel,
  getAllModels,
  getAllPublicModels,
  getAllWithSearch,
  getById,
  getByIdPublic,
  deleteModel,
  uploadGLB,
  updateConfig,
  multiUpdate,
  multiDelete,
  createVariation,
  updateVariation,
  deleteVariation,
  likeModel,
};
