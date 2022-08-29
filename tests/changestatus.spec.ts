import {test} from '../tests/fixtures/auth';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('run stream', async ({page, accountId}) => {
  // login(account.seedPhrase);
  // createstream();

  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('start');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkNewStreamStatus('Active');
});

test('pause stream', async ({page, accountId}) => {
  // login(account.seedPhrase);
  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkNewStreamStatus('Paused');
});

test('stop stream', async ({page, accountId}) => {
  // login(account.seedPhrase);
  const mystreams = new MyStreamsPage(page);
  mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  transaction.approve();
  mystreams.checkStreamDoesntExist();
});
