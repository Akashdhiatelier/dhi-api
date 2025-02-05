const config = require("../config/config");

const authRoutes = require("./v1/auth");
const dashboardRoutes = require("./v1/dashboard");
const userRoutes = require("./v1/users");
const modulesRoutes = require("./v1/modules");
const rolesRoutes = require("./v1/roles");
const roleAndPermissionRoutes = require("./v1/role-permissions");
const materialColorsRoutes = require("./v1/material_colors");
const categoriesRoutes = require("./v1/categories");
const materialsRoutes = require("./v1/materials");
const profileRoutes = require("./v1/profile");
const modelsRoutes = require("./v1/models");
const tagsRoutes = require("./v1/tags");
const cmsRoutes = require("./v1/cms");
const projectsRoutes = require("./v1/projects");
const logoutRoutes = require("./v1/logout");
const publicRoutes = require("./v1/publicRoutes");

const authMiddleware = require("../middlewares/auth");

const { ROUTE_CONSTANTS } = require("../utils/constants");

const apiRoute = `${config.defaultRoute.apiBaseRoot}/${config.defaultRoute.apiVersion}`;

module.exports = function (app) {
  app.get("/demo", function (req, res) {
    return res.render("index", { title: "Dhi Atelier" });
  });
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.AUTH}`, authRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.DASHBOARD}`, authMiddleware, dashboardRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.USERS}`, authMiddleware, userRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.MODULES}`, authMiddleware, modulesRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.ROLES}`, authMiddleware, rolesRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.ROLES_PERMISSION}`, authMiddleware, roleAndPermissionRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.MATERIAL_COLORS}`, authMiddleware, materialColorsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.MATERIALS}`, authMiddleware, materialsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.CATEGORIES}`, authMiddleware, categoriesRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.PROFILE}`, authMiddleware, profileRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.MODELS}`, authMiddleware, modelsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.TAGS}`, authMiddleware, tagsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.CMS}`, authMiddleware, cmsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.PROJECTS}`, authMiddleware, projectsRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.LOGOUT}`, logoutRoutes);
  app.use(`/${apiRoute}/${ROUTE_CONSTANTS.PUBLIC}`, publicRoutes);
};
