import {Page} from '@playwright/test';

import {test} from '../tests/fixtures/auth';
import {testReceiver} from '../tests/fixtures/auth-as-receiver';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {NotificationPage} from '../tests/pages/notification.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {createstream} from './shared/createstream';
import {login} from './shared/login';

let page: Page; //create variable with page
test.beforeAll(async ({browser}) => {
  page = await browser.newPage(); //Create a new Page instance
});
test('Create uneditable stream', async ({accountId}) => {
  //   login(account.seedPhrase);
  await login(page);

  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputPeriod('1000', '10', '10', '10');
  await stream.uneditable();
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkIfLastStreamLocked();
});

test('Create a delayed stream', async ({accountId}) => {
  await login(page);

  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputPeriod('1000', '10', '10', '10');
  await stream.setDelayed();
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkNewStreamStatus('Initialized');
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
  await login(page);
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputCliffPeriod();
  await stream.inputPeriod('36', '10', '10', '10');
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkNewStreamStatus('Active');
});
// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('Create a non-delayed stream', async ({accountId}) => {
  await login(page);
  await createstream(page, 'delusion.testnet', 'long');

  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('start');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkNewStreamStatus('Active');
});

test('pause stream', async ({accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  mystreams.checkNewStreamStatus('Paused');
});

test('stop stream', async ({accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkStreamDoesntExist();
});

test('withdraw all before test', async ({accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.withdraw();
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

testReceiver('create stream', async ({accountRecId}) => {
  await login(page);
  await createstream(page, 'pw7.testnet', 'short');
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkNewStreamStatus('Active');
});

test('not empty withdraw', async ({accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_NOT_BE_EMPTY = false;
  await mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
  await mystreams.waitUntilDue();
  await mystreams.withdrawFirst();
});

test('empty withdraw', async ({accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

test('run stream', async ({accountId}) => {
  //cy.viewport(1536, 960);
  await login(page);
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputPeriod('1000', '10', '10', '10');
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
  await login(page);
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
