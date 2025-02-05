const config = require("./config");

module.exports = {
  [config.env]: config.db,
};
