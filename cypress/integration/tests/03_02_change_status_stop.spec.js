import {login} from '../../support/login';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';

context('Stream stop', () => {
  let account;

  before(() => {
    cy.task('getAccount', {reuse: true}).then((testAccount) => (account = testAccount));
  });

  it('stop stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    const mystreams = new MyStreams();
    mystreams.changeStatus('stop');
    const transaction = new Transaction();
    transaction.approve();
    mystreams.checkStreamDoesntExist();
  });
});
