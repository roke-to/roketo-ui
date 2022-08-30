import {test} from '../tests/fixtures/auth';
// import {NearWallet} from '../page-objects/near-wallet';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('run stream', async ({page, accountId}) => {
  //cy.viewport(1536, 960);
  login(page);
  const stream = new CreateStreamPage(page);
  stream.createStream();
  stream.inputReceiver('delusion.testnet');
  stream.inputDeposit('1');
  stream.inputPeriod('1000', '10', '10', '10');
  // stream.inputComments('comment-comment');
  stream.submit();
  const transaction = new TransactionPage(page);
  transaction.approve();
  const mystreams = new MyStreamsPage(page);
  mystreams.checkNewStreamStatus('Active');
  mystreams.addFunds('1');
  transaction.approve();
  mystreams.checkAddFunds();
});
