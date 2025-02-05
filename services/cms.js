const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

const OPERATIONS = require("../repository/operations");

const db = require("../models");
const CustomError = require("../utils/customError");
const { isNumber, unlinkFile } = require("../utils/common");

const getBySlugController = async (slug) => {
  const q = {
    where: {
      [Op.and]: [
        {
          slug: {
            [Op.eq]: slug,
          },
        },
        {
          is_deleted: { [Op.eq]: false },
        },
      ],
    },
    attributes: ["page_title", "slug", "content"],
  };

  const getCms = await OPERATIONS.findOne(db.cms, q);
  if (!getCms) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }
  return getCms;
};

const updateBySlugController = async (slug, body) => {
  if (!slug) {
    throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "slug is required");
  }

  const { content } = body;

  const paramsToUpdate = {
    content,
  };

  const q = {
    where: {
      [Op.and]: [{ slug: { [Op.eq]: slug } }, { is_deleted: { [Op.eq]: false } }],
    },
  };
  const updateCms = await OPERATIONS.update(db.cms, paramsToUpdate, q);
  if (!updateCms) {
    throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Problem occured");
  }
  return true;
};

const getCMSData = async (title) => {
  try {
    if (!title) {
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "Title is required");
    }
    const getShowcase = await OPERATIONS.findAll(db.web_cms, {
      where: {
        title,
        is_deleted: false,
      },
      attributes: ["id", "media", "order"],
    });

    return getShowcase;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const addWebCMS = async (req) => {
  try {
    const { title, order } = req.params;

    if (!order) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "order is required");
    }

    if (!isNumber(order)) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "order must be a number");
    }

    const addNewOrder = OPERATIONS.create(db.web_cms, {
      title,
      order,
      media: req.file.path,
      created_by: req.userId,
    });

    if (!addNewOrder) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    return addNewOrder;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
};

const updateWebCMS = async (req) => {
  try {
    const { id } = req.params;

    const { order } = req.body;

    if (!id) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id is required");
    }

    if (!isNumber(id)) {
      if (req.file) {
        unlinkFile(req);
      }
      throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "id must be a number");
    }

    if (order && order === 0) {
      if (!isNumber(order)) {
        if (req.file) {
          unlinkFile(req);
        }
        throw new CustomError(StatusCodes.NOT_ACCEPTABLE, "order must be a number");
      }
    }

    const findValidRecord = await OPERATIONS.findById(db.web_cms, id);

    if (!findValidRecord) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Invalid id");
    }

    const updateRecord = await OPERATIONS.updateById(db.web_cms, id, {
      order: order || order === 0 ? order : findValidRecord.order,
      media: req.file ? req.file.path : findValidRecord.media,
      updated_by: req.userId,
    });
    if (!updateRecord) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    if (req.file) {
      const customReq = {
        file: {
          filename: findValidRecord.media.split("/").pop(),
        },
      };
      unlinkFile(customReq);
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

const deleteWebCMS = async (id, userId) => {
  try {
    const findValidRecord = await OPERATIONS.findById(db.web_cms, id);

    if (!findValidRecord) {
      throw new CustomError(StatusCodes.NOT_FOUND, "Invalid id");
    }

    const updateRecord = await OPERATIONS.updateById(db.web_cms, id, {
      is_deleted: true,
      deleted_by: userId,
    });
    if (!updateRecord) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    if (findValidRecord.media) {
      const customReq = {
        file: {
          filename: findValidRecord.media.split("/").pop(),
        },
      };
      unlinkFile(customReq);
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

module.exports = { getBySlugController, updateBySlugController, getCMSData, addWebCMS, updateWebCMS, deleteWebCMS };
