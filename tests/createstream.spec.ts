import {test} from '../tests/fixtures/auth';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
// import {NearWallet} from '../page-objects/near-wallet';
//import {LoginPage} from './pages/login.page';
import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('Create uneditable stream', async ({page, accountId}) => {
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

test('Create a delayed stream', async ({page, accountId}) => {
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

test('Create a non-delayed stream', async ({page, accountId}) => {
  // login(account.seedPhrase);

  //const homePage = new HomePage(page);

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
  await mystreams.checkNewStreamStatus('Active');
});

test('Create a stream with cliff', async ({page, accountId}) => {
  await login(page);
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
