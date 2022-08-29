import {expect, Page} from '@playwright/test';

import {createTestAccount} from '../shared/createTestAccount';

export class LoginPage {
  readonly page: Page;

  readonly elements = {
    urlRegExp: /https:\/\/wallet\.testnet\.near\.org\//,
    commonSubmitButton: '.button-group button.blue',
    // dashboardPageURL: '/dashboard',
    // treasuryPageURL: '/treasury',
    // loginURL: '/',
    // buttonSelectDao: 'button:has-text("Select DAO")',
    // buttonNearWallet: 'button:has-text("NEAR Wallet")',
    // accountId: '[data-qa="account"]',
    /// /
    buttonWalletSubmit: '[data-test-id="seedPhraseRecoverySubmitButton"]',
    homePageImportAccountButton: '[data-test-id="homePageImportAccountButton"]',
    recoverAccountWithPassphraseButton: '[data-test-id="recoverAccountWithPassphraseButton"]',
    seedPhraseRecoveryInput: '[data-test-id="seedPhraseRecoveryInput"]',
    seedPhraseRecoverySubmitButton: '[data-test-id="seedPhraseRecoverySubmitButton"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async recoverAccount() {
    await this.page.locator('[data-test-id="recoverAccountWithPassphraseButton"]').click();
  }

  async inputPassphrase(value) {
    await this.page.locator('input').type(value);
    // cy.get('input').click().type(value);
    await this.page.locator(this.elements.buttonWalletSubmit).click();
    // cy.get('[data-test-id="seedPhraseRecoverySubmitButton"]').click();
  }

  async pressNext() {
    await this.page.locator('.button-group > .blue').click();
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

  async importExistingAccount() {
    const buttonImportAccount = await this.page.locator('button', {
      hasText: 'Import a Different Account',
    });
    if ((await buttonImportAccount.count()) > 0) {
      // cy.get('.account-selector > .gray-blue').click({force: true});
      this.page.locator('.account-selector > .gray-blue').click({timeout: 200000});
    } else {
      await this.page.locator('.buttons > .link').click({timeout: 200000});
      // cy.get('.buttons > .link').click({force: true});
    }
  }

  //   async openLoginPage() {
  //     await this.page.goto(this.elements.loginURL);
  //   }

  //   async checkUserLoggedIn(accountId: string) {
  //     await this.page.waitForURL(this.elements.chooseDaoURL);
  //     await expect(this.page.locator(this.elements.accountId)).toHaveText(accountId);
  //   }

  //   async checkUserLoggedOut() {
  //     await expect(this.page).toHaveURL(this.elements.loginURL);
  //   }

  //   async chooseDao(daoId: string) {
  //     await this.page.locator('button', {hasText: daoId}).click();
  //     await this.page.locator(this.elements.buttonSelectDao).click();
  //   }

  //   async chooseNearWallet() {
  //     await this.page.locator(this.elements.buttonNearWallet).first().click();
  //   }

  async chooseFirstAccount() {
    await this.page.locator(this.elements.commonSubmitButton).click();
  }

  async submitButton() {
    await this.page.locator(this.elements.commonSubmitButton).click();
  }

  async loginNearAuthentificated() {
    await this.chooseFirstAccount();
    await this.submitButton();
  }
}
