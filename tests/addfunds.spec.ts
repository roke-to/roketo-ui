import {test} from '../tests/fixtures/auth';

// import {CreateStreamPage} from '../tests/pages/createstream.page';
// import {MyStreamsPage} from '../tests/pages/mystreams.page';
// import {TransactionPage} from '../tests/pages/transaction.page';
// import {login} from './shared/login';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('run stream', async ({page, accountId}) => {
  //   //cy.viewport(1536, 960);
  //   await login(page);
  //   const stream = new CreateStreamPage(page);
  //   await stream.createStream();
  //   await stream.inputReceiver('delusion.testnet');
  //   await stream.inputDeposit('1');
  //   await stream.inputPeriod('1000', '10', '10', '10');
  //   // stream.inputComments('comment-comment');
  //   await stream.submit();
  //   const transaction = new TransactionPage(page);
  //   await transaction.approve();
  //   const mystreams = new MyStreamsPage(page);
  //   await mystreams.checkNewStreamStatus('Active');
  //   await mystreams.addFunds('1');
  //   await transaction.approve();
  //   await mystreams.checkAddFunds();
});
