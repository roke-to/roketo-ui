import type {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';

export async function findRowByComment(
  comment: string,
  page: Page,
  shouldNotExist: boolean = false,
) {
  console.log('findRowByComment', comment);
  // eslint-disable-next-line no-promise-executor-return
  // await new Promise((rs) => setTimeout(rs, 2000));
  await page.locator(testSelectors.createStreamButton).isEnabled({timeout: 60000});
  await page.locator(testSelectors.streamListLoader).waitFor({state: 'detached'});
  let commentIndex = -1;
  const commLocator = page.locator(testSelectors.streamListCommentCell);
  const rowsTotal = await commLocator.count();
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rowsTotal; i++) {
    // eslint-disable-next-line no-await-in-loop
    const commentText = await commLocator.nth(i).innerText();
    if (commentText === comment) {
      commentIndex = i;
      break;
    }
  }
  if (shouldNotExist && commentIndex !== -1) {
    throw Error(`stream "${comment}" still exists: row ${commentIndex}`);
  }
  if (!shouldNotExist) {
    if (commentIndex === -1) {
      throw Error(`cant find a row with comment "${comment}"`);
    }
    console.log('row', comment, commentIndex);
  }
  return commentIndex;
}
