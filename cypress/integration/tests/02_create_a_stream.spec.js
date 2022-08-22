import {login} from '../../support/login';
import CreateStream from '../../support/pages/CreateStream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';

context('Stream creation', () => {
  let account;

  before(() => {
    cy.task('getAccount', {reuse: true}).then((testAccount) => (account = testAccount));
    cy.viewport(1536, 960);
  });
  it('Create uneditable stream', () => {
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('35m 10d 10h 10min');
    stream.moreOptions();
    stream.uneditable();
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkIfLastStreamLocked();
  });

  it('Create a delayed stream', () => {
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('35m 10d 10h 10min');
    stream.setDelayed();
    // stream.inputComments('comment-comment');
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
  });

  it('Create a non-delayed stream', () => {
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('35m 10d 10h 10min');
    stream.moreOptions();
    // stream.inputComments('comment-comment');
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
  });

  it('Create a stream with cliff period', () => {
    login(account.seedPhrase);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReceiver('delusion.testnet');
    stream.inputDeposit('1');
    stream.moreOptions();
    stream.inputCliffPeriod();
    stream.inputPeriod('35m 10d 10h 10min');
    // stream.inputComments('comment-comment');
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
  });
});
