import {test} from '../tests/fixtures/auth';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {createstream} from './shared/createstream';
import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('run stream', async ({page, accountId}) => {
  await login(page);
  await createstream(page, 'delusion.testnet', 'long');

  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('start');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkNewStreamStatus('Active');
});

test('pause stream', async ({page, accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  mystreams.checkNewStreamStatus('Paused');
});

test('stop stream', async ({page, accountId}) => {
  await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkStreamDoesntExist();
});
