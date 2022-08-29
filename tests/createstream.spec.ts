import {test} from '../tests/fixtures/auth';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('Create uneditable stream', async ({page, accountId}) => {
  //   login(account.seedPhrase);
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

test('Create a delayed stream', async ({page, accountId}) => {
  // login(account.seedPhrase);
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

test('Create a non-delayed stream', async ({page, accountId}) => {
  // login(account.seedPhrase);
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
  await mystreams.checkNewStreamStatus('Active');
});

test('Create a non-delayed stream', async ({page, accountId}) => {
  //login(account.seedPhrase);
  const stream = new CreateStreamPage(page);
  await stream.createStream();
  await stream.inputReceiver('delusion.testnet');
  await stream.inputDeposit('1');
  await stream.inputCliffPeriod();
  await stream.inputPeriod('12', '10', '10', '10');
  await stream.submit();
  const transaction = new TransactionPage(page);
  await transaction.approve();
  const mystreams = new MyStreamsPage(page);
  await mystreams.checkNewStreamStatus('Active');
});
