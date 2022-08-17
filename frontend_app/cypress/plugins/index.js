/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// module.exports = (on, config) => {
//   require("@cypress/code-coverage/task")(on, config);
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
//   console.log(config); // see what all is in here!

//   // modify config values
//   config.defaultCommandTimeout = 50000;
//   config.baseUrl = "http://localhost:3000";
//   config.env.codeCoverageTasksRegistered = true;
//   //config.baseUrl = 'https://app.clickai.ai'
//   // config.baseUrl = 'http://refactoring.clickai.ai/'
//   //config.baseUrl = 'https://stagingapp.clickai.ai'
//   //config.baseUrl = 'http://dslabaa.clickai.ai:13000'
//   // modify env var value
//   //config.env.ENVIRONMENT = 'prod'
//   //config.env.ENVIRONMENT = 'staging'
//   //config.env.ENVIRONMENT = 'enterprise'
//   return config;
// };

module.exports = (on, config) => {
  require("@cypress/code-coverage/task")(on, config);
  on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));

  return config;
};
