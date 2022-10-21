import type {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {TransactionPage} from '../pages/transaction.page';
import {findRowByComment} from './findRowByComment';

export async function addFunds(amount: string, comment: string, page: Page) {
  console.log('addFunds', amount, comment);
  const row = await findRowByComment(comment, page);
  await page.locator(testSelectors.streamControlsDropdown).nth(row).click({timeout: 20_000});
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((rs) => setTimeout(rs, 500));
  await page.locator(testSelectors.addFunds).nth(0).click({timeout: 20_000});
  await page.locator('[name="deposit"]').type(amount);
  await page.locator(testSelectors.addFundsSubmit).click();
  const transaction = new TransactionPage(page);
  await transaction.approve();
}

export async function checkAddFunds(expectedAmount: string, comment: string, page: Page) {
  console.log('checkAddFunds', comment);
  const row = await findRowByComment(comment, page);
  const progressCaption = await page
    .locator(testSelectors.streamProgressCaption)
    .nth(row)
    .innerText();
  if (!progressCaption.includes(`of ${expectedAmount}`)) {
    throw Error(
      `stream "${comment}" funds mismatch: need "x of ${expectedAmount}", got "${progressCaption}"`,
    );
  }
}
