const setEnv = (type) => {
  let envFile;
  switch (type) {
    case "production":
      envFile = ".env.production";
      break;
    case "staging":
      envFile = ".env.staging";
      break;
    default:
      envFile = ".env.development";
      break;
  }
  return envFile;
};

module.exports = setEnv;
