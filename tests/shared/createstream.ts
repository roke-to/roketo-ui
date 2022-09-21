import type {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {CreateStreamPage} from '../pages/createstream.page';
import {TransactionPage} from '../pages/transaction.page';

export async function createstream(
  page: Page,
  receiver: string,
  duration: string,
  comment?: string,
) {
  // export function createstream({receiver = 'githubtest9.testnet', duration} = {}) {
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver(receiver);
  await stream.inputDeposit('1');
  if (comment) {
    await stream.inputComments(comment);
  }
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

export async function createCustomStream({
  page,
  receiver = 'delusion.testnet',
  comment,
  delayed,
  deposit = '1',
  uneditable,
  period,
  cliff,
}: {
  page: Page;
  receiver?: string;
  comment: string;
  delayed?: boolean;
  deposit?: string;
  uneditable?: boolean;
  period: {
    month?: string;
    days?: string;
    hours?: string;
    mins?: string;
  };
  cliff?: boolean;
}) {
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver(receiver);
  await stream.inputDeposit(deposit);
  await stream.inputComments(comment);
  if (delayed) {
    await stream.setDelayed();
  }
  if (uneditable) {
    await stream.uneditable();
  }
  await stream.inputPeriod(
    period.month ?? '0',
    period.days ?? '0',
    period.hours ?? '0',
    period.mins ?? '0',
  );
  if (cliff) {
    await stream.inputCliffPeriod();
  }
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((rs) => setTimeout(rs, 2000));
  await page.locator(testSelectors.streamListLoader).waitFor({state: 'detached'});
}
