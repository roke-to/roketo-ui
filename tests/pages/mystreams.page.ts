import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {TransactionPage} from '../pages/transaction.page';

export class MyStreamsPage {
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

  async checkNewStreamStatus(value: string) {
    expect(
      await this.page.locator(testSelectors.streamStatusIcon).nth(0).getAttribute('alt'),
    ).toEqual(value);
  }
  async checkStreamDoesntExist() {
    await expect(this.page.locator(testSelectors.streamControlsDropdown)).toHaveCount(0);
  }

  async changeStatus(value: string) {
    this.page.locator(testSelectors.streamControlsDropdown).nth(0).click();
    if (value === 'start') {
      this.page.locator(testSelectors.streamStartButton).nth(0).click();
    }
    if (value === 'pause') {
      this.page.locator(testSelectors.streamPauseButton).nth(0).click();
    }
    if (value === 'stop') {
      this.page.locator(testSelectors.streamStopButton).nth(0).click();
      this.page.locator(testSelectors.streamModalStopButton).click();
    }
  }

  async visit() {
    await this.page.goto('http://localhost:3000/#/streams');
  }

  async checkPage() {
    // this.page.url()
    //  /https:\/\/wallet\.testnet\.near\.org\/login/
    // await expect(this.page).toHaveURL('/http:\/\/localhost:3000\/#\/streams');
    await expect(this.page).toHaveURL('http://localhost:3000/#/streams'),
      {
        timeout: 20000,
      };
    //cy.url().contains('http://localhost:3000/#/streams', {timeout: 20000});
  }

  async withdraw() {
    //   this.page.hover
    await this.page.hover(testSelectors.withdrawAllButton);
    await expect(this.page.locator(testSelectors.withdrawLoadingCaption)).toHaveCount(0);

    if (await !this.page.locator('body', {hasText: 'You have nothing to withdraw'})) {
      await this.page.locator(testSelectors.streamModalStopButton).click();
      const transaction = new TransactionPage(this.page);
      //await transaction.checkPage();
      await transaction.approve();
    }
  }

  async checkwithdraw(shouldBeEmpty: boolean) {
    await this.page.hover(testSelectors.withdrawAllButton);
    await expect(this.page.locator(testSelectors.withdrawLoadingCaption)).toHaveCount(0);
    // await page.locator('tr').count()
    // const IsEmpty =  await page.locator('tr').count()
    const isEmpty = await this.page
      .locator(testSelectors.withdrawTooltip, {hasText: 'You have nothing to withdraw'})
      .count();
    if (shouldBeEmpty === false && isEmpty === 0) {
      throw new Error(
        `${
          shouldBeEmpty
            ? "There shouldn't have been anything for withdrawal, but there was "
            : 'There should have been something for withdrawal, but there was '
        }`,
      );
    }
  }

  async waitUntilDue() {
    await expect(this.page.locator(testSelectors.streamProgressCaption).nth(0)).toHaveText(
      '-0.1 of 0.1',
    );
    // RegExp to catch "1 of 1" only and not "0.251 of 1". Move all received tokens to your wallet.You have nothing to withdraw
    // cy.get(testSelectors.streamProgressCaption)
    //   .eq(0)
    //   .contains(/\b1 of 1\b/, {timeout: 60000});
  }

  async checkIfLastStreamLocked() {
    await expect(this.page.locator(testSelectors.streamControlsDropdown)).toHaveCount(0);
    expect(await this.page.locator('span:has-text("Locked")')).not.toHaveCount(0);
  }

  async withdrawFirst() {
    await this.page.locator(testSelectors.streamControlsDropdown).nth(0).click();
    await this.page.locator(testSelectors.withdrawButton).nth(0).click();
    const transaction = new TransactionPage(this.page);
    //transaction.checkPage();
    await transaction.approve();
    await expect(this.page).toHaveURL(new RegExp('^http://localhost:3000/#/streams'));
  }

  async addFunds(value: string) {
    await this.page.locator(testSelectors.streamControlsDropdown).nth(0).click();
    await this.page.locator(testSelectors.addFunds).nth(0).click();
    await this.page.locator('[name="deposit"]').type(value);
    // cy.get('[name="deposit"]')
    //   .click({force: true}, {timeout: 60000})
    //   .type(' {backspace}')
    //   .type(value);
    await this.page.locator(testSelectors.addFundsSubmit).click();
  }

  async checkAddFunds() {
    await expect(this.page.locator(testSelectors.streamProgressCaption).nth(0)).toHaveText(
      '-0 of 1',
    );
  }
}
