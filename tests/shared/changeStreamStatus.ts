import type {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {TransactionPage} from '../pages/transaction.page';
import {findRowByComment} from './findRowByComment';

export async function changeStreamStatus(
  value: 'start' | 'pause' | 'stop',
  comment: string,
  page: Page,
) {
  console.log('changeStreamStatus', value, comment);
  const row = await findRowByComment(comment, page);
  await page.locator(testSelectors.streamControlsDropdown).nth(row).click({timeout: 20_000});
  switch (value) {
    case 'start':
      await page.locator(testSelectors.streamStartButton).nth(row).click({timeout: 20_000});
      break;
    case 'pause':
      await page.locator(testSelectors.streamPauseButton).nth(row).click({timeout: 20_000});
      break;
    case 'stop':
      await page.locator(testSelectors.streamStopButton).nth(row).click({timeout: 20_000});
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((rs) => setTimeout(rs, 500));
      await page.locator(testSelectors.streamModalStopButton).click({timeout: 20_000});
      break;
    default:
      throw Error(`unexpected stream status "${value}"`);
  }
  const transaction = new TransactionPage(page);
  await transaction.approve();
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((rs) => setTimeout(rs, 2000));
  await page.locator(testSelectors.streamListLoader).waitFor({state: 'detached'});
}
