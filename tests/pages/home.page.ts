import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';

export class HomePage {
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

  async visit() {
    await this.page.goto('http://localhost:3000/#/authorize');
  }

  async checkPage() {
    // this.page.url()
    //  /https:\/\/wallet\.testnet\.near\.org\/login/
    // await expect(this.page).toHaveURL('/http:\/\/localhost:3000\/#\/streams');
    await expect(this.page).toHaveURL(new RegExp('^http://localhost:3000/'));
  }

  async goToSignIn() {
    await this.page.locator(testSelectors.signInButton).click();
  }

  async logout() {
    await this.page.locator(testSelectors.signOutButton).click();
  }
}
