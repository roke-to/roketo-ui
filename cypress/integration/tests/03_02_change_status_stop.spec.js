import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';

context('Stream stop', () => {
  let account;

  before(() => {
    cy.task('getAccount').then((testAccount) => account = testAccount);
  });

  it('stop stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    const mystreams = new MyStreams();
    mystreams.visit();
    mystreams.changeStatus('stop');
    const transaction = new Transaction();
    transaction.approve();
  });
});
