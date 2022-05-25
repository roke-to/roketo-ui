import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';

it('stop stream', () => {
  cy.viewport(1536, 960);
  cy.wait(20000);
  login();
  const mystreams = new MyStreams();
  mystreams.getPage();
  cy.wait(20000);
  mystreams.changeStatus('stop');
  cy.wait(5000);
  const transaction = new Transaction();
  transaction.approve();
});
