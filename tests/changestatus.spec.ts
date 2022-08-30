import {test} from '../tests/fixtures/auth';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {createstream} from './shared/createstream';
import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('run stream', async ({page, accountId}) => {
  login(page);
  createstream(page, 'long');

  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('start');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkNewStreamStatus('Active');
});

test('pause stream', async ({page, accountId}) => {
  login(page);
  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkNewStreamStatus('Paused');
});

test('stop stream', async ({page, accountId}) => {
  login(page);
  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkStreamDoesntExist();
});
