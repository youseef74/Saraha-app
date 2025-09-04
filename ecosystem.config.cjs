module.exports = {
  apps: [
    {
      name: "aws-app",
      script: "src/index.js",   // entry point
      instances: 4,             // number of instances
      exec_mode: "cluster",     // cluster mode

      // Default environment
      env: {
        NODE_ENV: "dev"
      },

      // Production environment
      env_production: {
        NODE_ENV: "prod"
      },

      // Staging environment
      env_staging: {
        NODE_ENV: "staging"
      }
    }
  ]
};

