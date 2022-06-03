import {login} from '../../support/login';
import CreateStream from '../../support/pages/CreateStream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';

context('Stream creation', () => {
  let account;

  before(() => {
    cy.task('getAccount', {reuse: true}).then((testAccount) => (account = testAccount));
  });

  it('Create a delayed stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    // stream.inputComments('comment-comment');
    stream.setDelayed();
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
  });

  it('Create a non-delayed stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    // stream.inputComments('comment-comment');
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
  });
});
