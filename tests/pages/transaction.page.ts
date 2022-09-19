import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';

export class TransactionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async approve() {
    await this.page.locator('.button-group > .blue').click({timeout: 20000});
    //add TImeout
    // await expect(this.page.locator('button', {hasText: 'Sending'})).toHaveCount(0);
    //cy.contains('Sending', {timeout: 60000}).should('not.exist');
    await Promise.all([this.page.waitForNavigation({timeout: 60000})]);
  }

  async cancel() {
    await this.page.locator('.button-group > .grey-blue').click();
  }
}
