import {test} from '../tests/fixtures/auth';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('withdraw all before test', async ({page, accountId}) => {
  // login(account.seedPhrase);
  const mystreams = new MyStreamsPage(page);
  mystreams.withdraw();
  const SHOULD_BE_EMPTY = true;
  mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

test('create stream', async ({page, accountId}) => {
  // login(sender.seedPhrase);
  // createstream({duration: 'short', receiver: receiver.accountId});
  const mystreams = new MyStreamsPage(page);
  mystreams.checkNewStreamStatus('Active');
});

test('not empty withdraw', async ({page, accountId}) => {
  // login(receiver.seedPhrase);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_NOT_BE_EMPTY = false;
  mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
  mystreams.waitUntilDue();
  mystreams.withdrawFirst();
});

test('empty withdraw', async ({page, accountId}) => {
  // login(receiver.seedPhrase);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_BE_EMPTY = true;
  mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});
