import CreateStream from './pages/CreateStream';
import Transaction from './pages/TransactionPage';
import MyStreams from './pages/MyStreams';

export function createstream(testParams) {
  cy.wait(3000);
  const stream = new CreateStream();
  stream.createStream();
  stream.inputReciever('githubtest9.testnet');
  stream.inputDeposit('1');
  if (testParams === 'short') {
    stream.inputPeriod('0', '0', '0', '1');
  } else {
    stream.inputPeriod('1000', '10', '10', '10');
    // stream.inputComments('comment-comment');
    stream.uncheckAutostart();
  }
  stream.submit();
  const transaction = new Transaction();
  transaction.approve();
  cy.wait(20000);
}
