const { StatusCodes } = require("http-status-codes");

const catchAsync = require("../utils/catchAsync");
const projectService = require("../services/projects");

const { setSuccessResponse } = require("../utils/sendResponse");

const getAllController = catchAsync(async (req, res) => {
  const getAllProjects = await projectService.getAllProjects(req.body, req.userId);
  if (getAllProjects) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllProjects, "");
  }
});

const getAllProjectsPublicController = catchAsync(async (req, res) => {
  const getAllProjects = await projectService.getAllPublicProjects(req.body);
  if (getAllProjects) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllProjects, "");
  }
});

const getByIdController = catchAsync(async (req, res) => {
  const getById = await projectService.getById(req.params.id, req.userId, req.roleId);
  if (getById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getById, "");
  }
});

const getByIdProjectsPublicController = catchAsync(async (req, res) => {
  const getById = await projectService.getByIdPublic(req.params.id);
  if (getById) {
    return setSuccessResponse(res, StatusCodes.OK, true, getById, "");
  }
});

const deleteByIdController = catchAsync(async (req, res) => {
  const deleteById = await projectService.deleteById(req.params.id, req.userId, req.roleId);
  if (deleteById) {
    return setSuccessResponse(res, StatusCodes.OK, true, "", "Project Deleted");
  }
});

const addProjectController = catchAsync(async (req, res) => {
  const addProject = await projectService.addProject(req.body, req.userId, req);
  if (addProject) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, addProject, "");
  }
});

const updateProjectController = catchAsync(async (req, res) => {
  const updateProject = await projectService.updateProject(req.params.id, req.body, req.userId, req.roleId, req);
  if (updateProject) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateProject, "Project Updated");
  }
});

const uploadProjectController = catchAsync(async (req, res) => {
  const uploadProject = await projectService.uploadProject(req.params.id, req.userId, req.roleId, req);
  if (uploadProject) {
    return setSuccessResponse(res, StatusCodes.OK, true, "", "Project Uploaded");
  }
});

const multiUpdateController = catchAsync(async (req, res) => {
  const multiUpdateProjects = await projectService.multiUpdate(req.body, req.userId, req.roleId);
  if (multiUpdateProjects) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiUpdateProjects, "Projects Updated");
  }
});

const multiDeleteController = catchAsync(async (req, res) => {
  const multiDeleteProjects = await projectService.multiDelete(req.body, req.userId, req.roleId);
  if (multiDeleteProjects) {
    return setSuccessResponse(res, StatusCodes.OK, true, multiDeleteProjects, "Projects Deleted");
  }
});

const updateProjectConfigController = catchAsync(async (req, res) => {
  const updateProjectConfig = await projectService.updateProjectConfig(req.body, req.params.id, req.userId);
  if (updateProjectConfig) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, "", "Config Created");
  }
});

const createVariationController = catchAsync(async (req, res) => {
  const createVariation = await projectService.createVariation(req.body, req.params.id, req.userId, req);
  if (createVariation) {
    return setSuccessResponse(res, StatusCodes.CREATED, true, createVariation, "Variation Created");
  }
});
const updateVariationController = catchAsync(async (req, res) => {
  const updateVariation = await projectService.updateVariation(req.body, req.userId, req);
  if (updateVariation) {
    return setSuccessResponse(res, StatusCodes.OK, true, updateVariation, "Variation Updated");
  }
});

const deleteVariationController = catchAsync(async (req, res) => {
  const deleteVariation = await projectService.deleteVariation(req.params.id, req.userId);
  if (deleteVariation) {
    return setSuccessResponse(res, StatusCodes.OK, true, [], "Variation Deleted");
  }
});

const saveCameraViewController = catchAsync(async (req, res) => {
  const saveCameraView = await projectService.saveCameraView(req.params.id, req.userId, req.body);
  if (saveCameraView) {
    return setSuccessResponse(res, StatusCodes.OK, true, saveCameraView, "Added camera view successfully");
  }
});

const projectLikeController = catchAsync(async (req, res) => {
  const likeProject = await projectService.likeProject(req.params.id, req.userId, req.params.bool);
  if (likeProject) {
    return setSuccessResponse(res, StatusCodes.OK, true, likeProject, "Success");
  }
});

const projectSaveController = catchAsync(async (req, res) => {
  const saveProject = await projectService.saveProject(req.params.id, req.userId, req.params.bool);
  if (saveProject) {
    return setSuccessResponse(res, StatusCodes.OK, true, saveProject, "Success");
  }
});

const projectAddMediaController = catchAsync(async (req, res) => {
  const addProjectMedia = await projectService.addProjectMedia(req.params.id, req);
  if (addProjectMedia) {
    return setSuccessResponse(res, StatusCodes.OK, true, addProjectMedia, "Success");
  }
});

const projectDeleteMediaController = catchAsync(async (req, res) => {
  const deleteProjectMedia = await projectService.deleteProjectMedia(req.params.id, req.query.media, res);
  if (deleteProjectMedia) {
    return setSuccessResponse(res, StatusCodes.OK, true, deleteProjectMedia, "Success");
  }
});

const getProjectCommentsController = catchAsync(async (req, res) => {
  const getProjectComments = await projectService.getProjectComments(req.params.id);
  if (getProjectComments) {
    return setSuccessResponse(res, StatusCodes.OK, true, getProjectComments, "Success");
  }
});

const addProjectCommentController = catchAsync(async (req, res) => {
  const addProjectComment = await projectService.addProjectComment(req.params.id, req.userId, req.body);
  if (addProjectComment) {
    return setSuccessResponse(res, StatusCodes.OK, true, addProjectComment, "Success");
  }
});

const getAllLikedProjectController = catchAsync(async (req, res) => {
  const getAllLikedProject = await projectService.getAllLikedProject(req.body, req.userId);
  if (getAllLikedProject) {
    return setSuccessResponse(res, StatusCodes.OK, true, getAllLikedProject, "Success");
  }
});

module.exports = {
  getAllController,
  getByIdController,
  deleteByIdController,
  addProjectController,
  updateProjectController,
  uploadProjectController,
  multiUpdateController,
  multiDeleteController,
  updateProjectConfigController,
  createVariationController,
  updateVariationController,
  deleteVariationController,
  saveCameraViewController,
  getAllProjectsPublicController,
  getByIdProjectsPublicController,
  projectLikeController,
  projectSaveController,
  projectAddMediaController,
  projectDeleteMediaController,
  getProjectCommentsController,
  addProjectCommentController,
  getAllLikedProjectController,
};
