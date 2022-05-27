import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';

context('Stream pause', () => {
  let account;

  before(() => {
    cy.task('getAccount', { reuse: true }).then((testAccount) => account = testAccount);
  });

  it('pause stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    const mystreams = new MyStreams();
    mystreams.visit();
    mystreams.changeStatus('pause');
    const transaction = new Transaction();
    transaction.approve();
    mystreams.checkNewStreamStatus('Paused');
  });
});
