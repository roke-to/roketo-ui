import {test as base} from '@playwright/test';
import path from 'path';

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  accountId: async ({}, use) => {
    use('anarocketo04.testnet');
  },
  page: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../shared/authstate.json'),
    });
    const page = await context.newPage();

    use(page);
  },
});
