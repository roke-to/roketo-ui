import {Page} from '@playwright/test';

import {CreateStreamPage} from '../pages/createstream.page';
import {TransactionPage} from '../pages/transaction.page';

export async function createstream(page: Page, duration: string) {
  // export function createstream({receiver = 'githubtest9.testnet', duration} = {}) {
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  if (duration === 'short') {
    await stream.inputPeriod('0', '0', '0', '1');
  } else {
    await stream.inputPeriod('1000', '10', '10', '10');
    // stream.inputComments('comment-comment');
    await stream.setDelayed();
  }
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
}
