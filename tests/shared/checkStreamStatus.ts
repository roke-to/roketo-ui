import type {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {findRowByComment} from './findRowByComment';

export async function checkStreamStatus(value: string, comment: string, page: Page) {
  console.log('checkStreamStatus', value, comment);
  const row = await findRowByComment(comment, page);
  const alt = await page.locator(testSelectors.streamStatusIcon).nth(row).getAttribute('alt');
  console.log('alt', alt);
  if (alt !== value) throw Error(`expect alt to be "${value}" got "${alt}"`);
}
