import {createstream} from '../../support/createstream';
import {login} from '../../support/login';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';

context('Stream start', () => {
  let account;

  before(() => {
    cy.task('getAccount', {reuse: true}).then((testAccount) => (account = testAccount));
  });

  it('run stream', () => {
    cy.viewport(1536, 960);
    login(account.seedPhrase);
    createstream();

    const mystreams = new MyStreams();
    mystreams.changeStatus('start');
    const transaction = new Transaction();
    transaction.approve();
    mystreams.checkNewStreamStatus('Active');
  });
});
