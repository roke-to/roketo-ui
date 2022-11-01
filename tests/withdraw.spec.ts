import {Page} from '@playwright/test';

import {test} from '../tests/fixtures/auth';
// import {test_receiver} from '../tests/fixtures/auth-as-receiver';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {checkStreamStatus} from './shared/checkStreamStatus';
import {createCustomStream, createstream} from './shared/createstream';
// import {createstream} from './shared/createstream';
import {login, login3} from './shared/login';

// let page: Page; //create variable with page
// test.beforeAll(async ({browser}) => {
//   page = await browser.newPage(); //Create a new Page instance
// });

test('withdraw all', async ({accountId, page}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.withdraw();
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

test('withdraw local', async ({page, accountId}) => {
  await login(page);
  const comment = createComment('not empty withdraw');
  const receiver = 'pw6.testnet';
  const deposit = '0.1';
  await createCustomStream({
    page,
    receiver: receiver,
    comment,
    deposit: deposit,
    period: {mins: '1'},
  });

  // await createstream(page, 'pw7.testnet', 'short');
  const mystreams = new MyStreamsPage(page);
  // await mystreams.checkNewStreamStatus('Active');
  await checkStreamStatus('Active', comment, page);
  await login3(page); //login as receiver
  // const mystreams = new MyStreamsPage(page);
  const SHOULD_NOT_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
  await mystreams.waitUntilDue(comment, page);
  await mystreams.withdrawFirst(comment, page);
});

function createComment(testName: string) {
  const tag = Math.random().toString().slice(2, 8);
  const comment = `${testName} ${tag}`;
  return comment.slice(0, 60);
}
