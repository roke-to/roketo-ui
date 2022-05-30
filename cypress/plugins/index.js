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

import fs from 'fs';
import { createTestAccount } from '../support/createTestAccount';

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    async getAccount({ filename = 'testAccount', reuse = false } = {}) {
      const path = `./${filename}.json`;

      if (!reuse) {
        try {
          fs.unlinkSync(path);
        } catch(whatever) {}
      }

      try {
        return JSON.parse(fs.readFileSync(path, 'utf-8'));
      } catch(noFileExists) {
        const account = await createTestAccount();

        fs.writeFileSync(path, JSON.stringify(account), 'utf-8');

        return account;
      }
    },
  });
};
