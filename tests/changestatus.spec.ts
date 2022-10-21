import {Page} from '@playwright/test';

import {testSelectors} from '../src/shared/constants';
import {test} from '../tests/fixtures/auth';
import {testReceiver} from '../tests/fixtures/auth-as-receiver';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {NotificationPage} from '../tests/pages/notification.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {accountId, seedPhrase} from './fixtures/rec.json';
import {changeStreamStatus} from './shared/changeStreamStatus';
import {checkStreamStatus} from './shared/checkStreamStatus';
import {createCustomStream, createstream} from './shared/createstream';
import {login, login2} from './shared/login';

let page: Page; //create variable with page
test.beforeAll(async ({browser}) => {
  page = await browser.newPage(); //Create a new Page instance
  await login(page);
});

test('Create uneditable stream', async ({accountId}) => {
  //   login(account.seedPhrase);
  // await login(page);

  const comment = createComment('uneditable stream');
  await createCustomStream({
    page,
    comment,
    period: {month: '1000', days: '10', hours: '10', mins: '10'},
    uneditable: true,
  });
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkIfLastStreamLocked(comment, page);
});

test('Create a delayed stream', async ({accountId}) => {
  // await login(page);
  const comment = createComment('delayed stream');
  await createCustomStream({
    page,
    comment,
    period: {month: '1000', days: '10', hours: '10', mins: '10'},
    delayed: true,
  });
  await checkStreamStatus('Initialized', comment, page);
});

// test('Create a non-delayed stream', async ({accountId}) => {
//   // login(account.seedPhrase);

//   //const homePage = new HomePage(page);

//   await login(page);

//   const stream = new CreateStreamPage(page);
//   await stream.createStream();
//   await stream.inputReceiver('delusion.testnet');
//   await stream.inputDeposit('1');
//   await stream.inputPeriod('1000', '10', '10', '10');
//   await stream.uneditable();
//   await stream.submit();
//   const transaction = new TransactionPage(page);
//   await transaction.approve();
//   const mystreams = new MyStreamsPage(page);
//   await mystreams.checkNewStreamStatus('Active');
// });

test('Create a stream with cliff', async ({accountId}) => {
  // await login(page);
  const comment = createComment('stream with cliff');
  await createCustomStream({
    page,
    comment,
    period: {month: '36', days: '10', hours: '10', mins: '10'},
    cliff: true,
  });
  await checkStreamStatus('Active', comment, page);
});
// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('Create a non-delayed stream', async ({accountId}) => {
  // await login(page);
  const comment = createComment('non-delayed stream');
  console.log('create stream', comment);
  await createstream(page, 'delusion.testnet', 'long', comment);
  await page.locator(testSelectors.streamListLoader).waitFor({state: 'detached'});
  await changeStreamStatus('start', comment, page);
  await checkStreamStatus('Active', comment, page);
});

test('pause stream', async ({accountId}) => {
  // await login(page);
  const comment = createComment('pause stream');
  await createCustomStream({
    page,
    comment,
    period: {hours: '10'},
  });
  await changeStreamStatus('pause', comment, page);
  await checkStreamStatus('Paused', comment, page);
});

test('stop stream', async ({accountId}) => {
  // await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkStreamDoesntExist();
});

test('withdraw all', async ({accountId}) => {
  // await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.withdraw();
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

testReceiver('withdraw local', async ({accountRecId}) => {
  // await login(page);
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
  await mystreams.checkNewStreamStatus('Active');

  await login2(page, seedPhrase); //login as receiver
  // const mystreams = new MyStreamsPage(page);
  const SHOULD_NOT_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
  await mystreams.waitUntilDue(comment, page);
  await mystreams.withdrawFirst(comment, page);
});

// test('empty withdraw', async ({accountId}) => {
//   // await login(page);
//   const mystreams = new MyStreamsPage(page);
//   const SHOULD_BE_EMPTY = true;
//   await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
// });

test('run stream', async ({accountId}) => {
  //cy.viewport(1536, 960);
  // await login(page);
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputPeriod(`1000m 10d 10h 10m`);
  // stream.inputComments('comment-comment');
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkNewStreamStatus('Active');
  await mystreams.addFunds('1');
  await transaction.approve();
  await mystreams.checkAddFunds();
});

test('Sender NotificationsCheck', async ({accountId}) => {
  // await login(page);
  await createstream(page, 'pw6.testnet', 'short');
  const notif = new NotificationPage(page);
  //await notif.openNotifications();
  await notif.waitForInitialLoading();
  // logout();

  // login(sender.seedPhrase);
  // createstream({duration: 'short', receiver: receiver.accountId});
  const mystreams = new MyStreamsPage(page);
  // mystreams.checkNewStreamStatus('Active');

  await notif.openNotifications();
  await notif.checknew('start', 'pw6.testnet');
  //await notif.checknew('start', 'delusion.testnet');

  await mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('pause', 'pw6.testnet');
  //await notif.checknew('pause', 'delusion.testnet');
  await mystreams.changeStatus('start');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('restart', 'pw6.testnet');
  // await notif.checknew('restart', 'delusion.testnet');

  //add funds
  await mystreams.addFunds('1');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('funds', 'pw6.testnet');

  await mystreams.changeStatus('stop');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('stop', 'pw6.testnet');
});

// test('Receiver NotificationsCheck', async ({accountId}) => {
//   login(page);
//   const notif = new NotificationPage(page);
//   notif.openNotifications();
//   // notif.checkReceiver('start', sender.accountId);
//   // notif.checkReceiver('pause', sender.accountId);
//   // notif.checkReceiver('restart', sender.accountId);
//   // notif.checkReceiver('funds', sender.accountId);
//   // notif.checkReceiver('stop', sender.accountId);
// });

function createComment(testName: string) {
  const tag = Math.random().toString().slice(2, 8);
  const comment = `${testName} ${tag}`;
  return comment.slice(0, 60);
}
