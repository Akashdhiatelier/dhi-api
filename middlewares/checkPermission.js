function checkPermission(permission) {
  //   return function (req, res, next) {
  //     const userRole = req.user.role;
  //     if (roles[userRole].permissions.includes(permission)) {
  //       next();
  //     } else {
  //       res.status(403).json({ message: "Forbidden" });
  //     }
  //   };
}

module.exports = checkPermission;
