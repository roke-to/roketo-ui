import {test} from '../tests/fixtures/auth';
import {test_receiver} from '../tests/fixtures/auth-as-receiver';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {createstream} from './shared/createstream';
import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('withdraw all before test', async ({page, accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.withdraw();
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});

test_receiver('create stream', async ({page_rec, accountRecId}) => {
  await login(page_rec);
  await createstream(page_rec, 'playwright5.testnet', 'short');
  const mystreams = new MyStreamsPage(page_rec);
  await mystreams.checkNewStreamStatus('Active');
});

test('not empty withdraw', async ({page, accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_NOT_BE_EMPTY = false;
  await mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
  await mystreams.waitUntilDue();
  await mystreams.withdrawFirst();
});

test('empty withdraw', async ({page, accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  const SHOULD_BE_EMPTY = true;
  await mystreams.checkwithdraw(SHOULD_BE_EMPTY);
});
