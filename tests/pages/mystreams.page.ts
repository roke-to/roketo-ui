import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {TransactionPage} from '../pages/transaction.page';
// import { findRowByComment } from 'tests/shared/findRowByComment';
import {findRowByComment} from '../shared/findRowByComment';

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
    await this.page.locator(testSelectors.streamControlsDropdown).nth(0).click();
    if (value === 'start') {
      await this.page.locator(testSelectors.streamStartButton).nth(0).click();
    }
    if (value === 'pause') {
      await this.page.locator(testSelectors.streamPauseButton).nth(0).click();
    }
    if (value === 'stop') {
      await this.page.locator(testSelectors.streamStopButton).nth(0).click();
      await this.page.locator(testSelectors.streamModalStopButton).click();
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

  async waitUntilDue(comment: string, page: Page) {
    let index = await findRowByComment(comment, page);
    await this.page.waitForTimeout(60000);
    expect(await this.page.locator('[data-testid="streamProgressCaption"]').nth(index)).toHaveText(
      // '-0.1 of 0.1',
      '+0.1 of 0.1',
      {timeout: 60000},
    );
    // await expect(this.page.locator(testSelectors.streamProgressCaption).nth(0)).toHaveText(
    //   '-0.1 of 0.1',
    // );
    // RegExp to catch "1 of 1" only and not "0.251 of 1". Move all received tokens to your wallet.You have nothing to withdraw
    // cy.get(testSelectors.streamProgressCaption)
    //   .eq(0)
    //   .contains(/\b1 of 1\b/, {timeout: 60000});
  }

  async checkIfLastStreamLocked(comment: string, page: Page) {
    let index = await findRowByComment(comment, page);
    expect(await this.page.locator('[data-testid="streamListReceiver"]').nth(index)).toHaveText(
      'Locked',
    );
    // await expect(this.page.locator(testSelectors.streamControlsDropdown)).toHaveCount(0);
    // expect(await this.page.locator('span:has-text("Locked")')).not.toHaveCount(0);
  }

  async withdrawFirst(comment: string, page: Page) {
    let index = await findRowByComment(comment, page);
    await this.page.locator(testSelectors.streamControlsDropdown).nth(index).click();
    await this.page.locator(testSelectors.withdrawButton).nth(index).click();
    // await this.page.locator(testSelectors.streamControlsDropdown).nth(0).click();
    // await this.page.locator(testSelectors.withdrawButton).nth(0).click();
    const transaction = new TransactionPage(this.page);
    //transaction.checkPage();
    await transaction.approve();
    await expect(this.page).toHaveURL(new RegExp('^http://localhost:3000/#/streams'));
    // expect(await this.page.locator('[data-testid="streamListReceiver"]').nth(index)).toHaveCount(0);
    await expect(page.locator(testSelectors.streamListCommentCell).nth(index)).not.toContainText(
      comment,
    );
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
      '-0 of 2',
    );
  }
}