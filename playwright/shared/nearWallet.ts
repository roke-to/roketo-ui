import {expect, Page} from '@playwright/test';

import {createTestAccount} from './createTestAccount';

export class NearWallet {
  readonly page: Page;

  readonly elements = {
    commonSubmitButton: '.button-group button.blue',
    urlRegExp: /https:\/\/wallet\.testnet\.near\.org\//,
    homePageImportAccountButton: '[data-test-id="homePageImportAccountButton"]',
    recoverAccountWithPassphraseButton: '[data-test-id="recoverAccountWithPassphraseButton"]',
    seedPhraseRecoveryInput: '[data-test-id="seedPhraseRecoveryInput"]',
    seedPhraseRecoverySubmitButton: '[data-test-id="seedPhraseRecoverySubmitButton"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async chooseFirstAccount() {
    await this.page.locator(this.elements.commonSubmitButton).click();
  }

  async submitButton() {
    await this.page.locator(this.elements.commonSubmitButton).click();
  }

  async checkIsRedirectedToNear() {
    await expect(this.page).toHaveURL(this.elements.urlRegExp);
  }

  async loginToNear() {
    const {seedPhrase} = await createTestAccount();
    await this.page.locator(this.elements.homePageImportAccountButton).click();
    await this.page.locator(this.elements.recoverAccountWithPassphraseButton).click();
    await this.page.locator(this.elements.seedPhraseRecoveryInput).type(seedPhrase);
    await this.page.locator(this.elements.seedPhraseRecoverySubmitButton).click();
    await this.page.locator(this.elements.commonSubmitButton).click();
    await this.page.locator(this.elements.commonSubmitButton).click();
  }
}
