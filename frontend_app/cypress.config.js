const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    baseUrl: "http://localhost:13000",
    supportFile: "cypress/support/e2e.js",
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  chromeWebSecurity: false,
  env: {
    email: "front_test@dslab.global",
    password: "",
  },
});
