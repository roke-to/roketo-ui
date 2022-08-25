import {Page} from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly elements = {
    loginURL: '/#/authorize',
    signInButton: '[data-testid="signInButton"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async openLoginPage() {
    await this.page.goto(this.elements.loginURL);
  }

  async clickSignIn() {
    await this.page.locator(this.elements.signInButton).click();
  }
}
