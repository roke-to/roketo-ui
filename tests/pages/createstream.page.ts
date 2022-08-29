import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';

export class CreateStreamPage {
  readonly page: Page;

  readonly elements = {
    chooseDaoURL: '/dao',
    dashboardPageURL: '/dashboard',
    treasuryPageURL: '/treasury',
    myStreamsURL: '#/streams',
    buttonSelectDao: 'button:has-text("Select DAO")',
    buttonNearWallet: 'button:has-text("NEAR Wallet")',
    accountId: '[data-qa="account"]',
    ////
  };

  constructor(page: Page) {
    this.page = page;
  }

  async createStream() {
    await this.page.locator(testSelectors.createStreamButton).click();
  }

  async inputReceiver(value) {
    await this.page.locator(testSelectors.createStreamReceiverInput).type(value);
    //cy.get(testSelectors.createStreamReceiverInput).click().click().type(value);
  }

  async inputDeposit(value) {
    await this.page.locator(testSelectors.createStreamAmountInput).type(value);
    //cy.get(testSelectors.createStreamAmountInput).click().type(' {backspace}').type(value);
  }

  async inputPeriod(month, days, hours, mins) {
    if (month !== '0') {
      await this.page.locator(testSelectors.createStreamMonthsInput).type(month);
    }
    // select days
    if (days !== '0') {
      await this.page.locator(testSelectors.createStreamDaysInput).type(days);
    }
    // select hours
    if (hours !== '0') {
      await this.page.locator(testSelectors.createStreamHoursInput).type(hours);
    }
    // select mins
    await this.page.locator(testSelectors.createStreamMinutesInput).type(mins);
  }
  async inputCliffPeriod() {
    const currentTimeInMilliseconds = new Date();
    await this.page
      .locator('[aria-label="Month"]')
      .type(currentTimeInMilliseconds.getMonth().toString());
    await this.page
      .locator('[aria-label="Day"]')
      .type(currentTimeInMilliseconds.getDay().toString());
    await this.page
      .locator('[aria-label="Year"]')
      .type((currentTimeInMilliseconds.getFullYear() + 1).toString());
    await this.page
      .locator('[aria-label="Hour"]')
      .type(currentTimeInMilliseconds.getHours().toString());
    await this.page
      .locator('[aria-label="Minute"]')
      .type(currentTimeInMilliseconds.getMinutes().toString());
    await this.page
      .locator('[aria-label="Second"]')
      .type(currentTimeInMilliseconds.getSeconds().toString());
    await this.page.locator('[aria-label="Select AM/PM"]').selectOption('AM');
  }

  async inputComments(value) {
    await this.page.locator(testSelectors.createStreamCommentInput).type(value);
  }

  async setDelayed() {
    await this.page.locator(testSelectors.createStreamDelayedCheckbox).click();
  }

  async submit() {
    await this.page.locator(testSelectors.createStreamSubmitButton).click();
  }

  async uneditable() {
    await this.page.locator(testSelectors.createStreamLockedCheckbox).click();
  }
}
