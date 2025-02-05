module.exports = {
  apps: [
    {
      name: "DhiAtelier - Live",
      script: "./bin/www",
      env_development: {
        PORT: 8080,
        NODE_ENV: "development",
      },
      env_staging: {
        PORT: 8080,
        NODE_ENV: "staging",
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
