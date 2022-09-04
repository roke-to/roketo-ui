import {test as base} from '@playwright/test';
import path from 'path';

export const test_receiver = base.extend({
  // eslint-disable-next-line no-empty-pattern
  accountRecId: async ({}, use) => {
    use('playwright4.testnet');
  },
  page_rec: async ({browser}, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, './near-authenticated-storage-receiver.json'),
    });
    const page = await context.newPage();

    use(page);
  },
});
