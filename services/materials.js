const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const fs = require("fs");

const OPERATIONS = require("../repository/operations");
const CustomError = require("../utils/customError");

const db = require("../models");
const { unlinkFile, getPaginatedData, isNumber, slugifyString } = require("../utils/common");

const add = async (body, userId, req) => {
  const { name, color, tags, price, status } = body;

  const slug = slugifyString(name);

  const query = {
    where: {
      [Op.and]: [
        {
          slug: {
            [Op.eq]: slug,
          },
        },
        {
          user_id: {
            [Op.eq]: userId,
          },
        },
        { is_deleted: { [Op.eq]: false } },
      ],
    },
  };

  const checkMaterial = await OPERATIONS.findOne(db.materials, query);

  if (checkMaterial) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Material already exists");
  }

  const colorCheckQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: color } }, { is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
  };

  const checkColor = await OPERATIONS.findOne(db.material_colors, colorCheckQuery);
  if (!checkColor) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Color does not exists!");
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
      material_color_id: color,
      name,
      color: checkColor.name,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      price,
      status,
      thumbnail: req.file ? `public/uploads/${req.file.filename}` : "",
      created_by: userId,
    };

    const addMaterial = await OPERATIONS.create(db.materials, paramsToUpdate, { transaction: t1 });
    if (!addMaterial) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
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

    const material = {
      id: addMaterial.id,
      name: addMaterial.name,
      color: addMaterial.color,
      price: addMaterial.price,
      status: addMaterial.status,
      thumbnail: addMaterial.thumbnail,
      tags: addMaterial.tags,
    };

    await t1.commit();
    await t2.commit();
    return material;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || error.errorMessage || "Error occured");
  }
};

const getAll = async (body, userId) => {
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
        { color: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
        { price: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    order: [[_sort, _order.toUpperCase()]],
    include: [
      {
        model: db.material_colors,
        attributes: ["name", "color"],
      },
    ],
    attributes: ["id", "name", "tags", "thumbnail", "price", "status"],
  };

  const getPanigated = await getPaginatedData(db.materials, offset, limit, query);

  if (!getPanigated) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }

  return getPanigated;
};

const getById = async (id, userId, roleId) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: id } }, roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }],
    },
    include: [
      {
        model: db.material_colors,
        attributes: ["id", "name", "color"],
      },
    ],
    attributes: ["id", "name", "tags", "price", "status", "thumbnail"],
  };

  const findMaterial = await OPERATIONS.findOne(db.materials, query);
  if (!findMaterial) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Can not find material");
  }
  return findMaterial;
};
const getByIdPublic = async (id) => {
  const query = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: id } }],
    },
    include: [
      {
        model: db.material_colors,
        attributes: ["id", "name", "color"],
      },
    ],
    attributes: ["id", "name", "tags", "price", "status", "thumbnail"],
  };

  const findMaterial = await OPERATIONS.findOne(db.materials, query);
  if (!findMaterial) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Can not find material");
  }
  return findMaterial;
};

const update = async (body, materialId, userId, req) => {
  if (!materialId) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Id is required");
  }

  if (!isNumber(materialId)) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
  }

  const { name, color, tags, price, status } = body;

  const query = {
    where: {
      [Op.and]: [
        {
          id: {
            [Op.eq]: materialId,
          },
        },
        {
          user_id: {
            [Op.eq]: userId,
          },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };

  const checkMaterial = await OPERATIONS.findOne(db.materials, query);
  if (!checkMaterial) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Material not found");
  }

  const slug = slugifyString(name);

  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };

  const checkDuplicate = await OPERATIONS.findOne(db.materials, q);
  if (checkDuplicate) {
    throw new CustomError(StatusCodes.CONFLICT, "Material already exists");
  }

  let fileToDelete = "";
  if (req.file) {
    fileToDelete = checkMaterial.thumbnail;
  }
  const colorCheckQuery = {
    where: {
      [Op.and]: [{ id: { [Op.eq]: color } }, { is_deleted: { [Op.eq]: false } }, { user_id: { [Op.eq]: userId } }],
    },
  };

  const checkColor = await OPERATIONS.findOne(db.material_colors, colorCheckQuery);
  if (!checkColor) {
    if (req.file) {
      unlinkFile(req);
    }
    throw new CustomError(StatusCodes.NOT_FOUND, "Color does not exists!");
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
      material_color_id: color,
      name,
      slug,
      color: checkColor.name,
      tags: reducedTags && reducedTags.length > 0 ? reducedTags.join(",") : null,
      price,
      status,
      thumbnail: req.file ? `public/thumbnails/${req.file.filename}` : checkMaterial.dataValues.thumbnail,
      updated_by: userId,
    };

    const updateMaterial = await OPERATIONS.updateById(db.materials, materialId, paramsToUpdate, { transaction: t1 });
    if (!updateMaterial) {
      if (req.file) {
        unlinkFile(req);
      }
      errorMessage = "Problem occured!";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
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
          console.log(`File does not exist.`);
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
          console.log(`File does not exist.`);
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

    await t1.commit();
    await t2.commit();
    return updateMaterial;
  } catch (error) {
    await t1.rollback();
    await t2.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || error.errorMessage || "Error occured");
  }
};

const deleteMaterialById = async (materialId, userId) => {
  const query = {
    where: {
      [Op.and]: [
        {
          id: {
            [Op.eq]: materialId,
          },
        },
        {
          user_id: { [Op.eq]: userId },
        },
        {
          is_deleted: {
            [Op.eq]: false,
          },
        },
      ],
    },
  };
  const checkMaterial = await OPERATIONS.findOne(db.materials, query);
  if (!checkMaterial) {
    throw new CustomError(StatusCodes.NOT_FOUND, "Material is not exists!");
  }

  if (checkMaterial.is_deleted) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Material already deleted");
  }

  const paramsToUpdate = {
    is_deleted: true,
    deleted_at: new Date(),
    deleted_by: userId,
  };

  const deleteMaterial = await OPERATIONS.updateById(db.materials, materialId, paramsToUpdate);
  if (!deleteMaterial) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured!");
  }
  return deleteMaterial;
};

const multiUpdate = async (body, userId, roleId) => {
  const { material_ids: materialIds, status } = body;

  const materialQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getMaterials = await OPERATIONS.findAll(db.materials, materialQuery);
  const getMaterialIds = getMaterials.map((i) => i.id);
  const invalidIds = materialIds.filter((id) => !getMaterialIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Material Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      status,
      updated_by: userId,
    };
    const bulkUpdate = await db.materials.update(
      dataToUpdate,
      { where: { id: { [Op.in]: materialIds } } },
      { transaction: t }
    );
    if (!bulkUpdate) {
      errorMessage = "Error occured while updating materials";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while updating materials");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while updating materials");
  }
  return true;
};

const multiDelete = async (body, userId, roleId) => {
  const { material_ids: materialIds } = body;

  const materialQuery = {
    where: {
      [Op.and]: [roleId === 1 ? {} : { user_id: { [Op.eq]: userId } }, { is_deleted: { [Op.eq]: false } }],
    },
    attributes: ["id"],
  };
  const getMaterials = await OPERATIONS.findAll(db.materials, materialQuery);
  const getMaterialIds = getMaterials.map((i) => i.id);
  const invalidIds = materialIds.filter((id) => !getMaterialIds.includes(id));
  if (invalidIds.length > 0) {
    throw new CustomError(StatusCodes.NOT_FOUND, `Material Ids ${invalidIds.toString()} are invalid!`);
  }

  const t = await db.sequelize.transaction();
  let errorMessage = "";
  try {
    const dataToUpdate = {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    };
    const bulkDelete = await db.materials.update(
      dataToUpdate,
      { where: { id: { [Op.in]: materialIds } } },
      { transaction: t }
    );
    if (!bulkDelete) {
      errorMessage = "Error occured while deleting materials";
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Error occured while deleting materials");
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, errorMessage || "Error occured while deleting materials");
  }
  return true;
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  deleteMaterialById,
  multiUpdate,
  multiDelete,
  getByIdPublic,
};
