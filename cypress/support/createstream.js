import CreateStream from './pages/CreateStream';
import Transaction from './pages/TransactionPage';

export function createstream({ receiver = 'githubtest9.testnet', duration } = {}) {
  const stream = new CreateStream();
  stream.createStream();
  stream.inputReceiver(receiver);
  stream.inputDeposit('1');
  if (duration === 'short') {
    stream.inputPeriod('0', '0', '0', '1');
  } else {
    stream.inputPeriod('1000', '10', '10', '10');
    // stream.inputComments('comment-comment');
    stream.uncheckAutostart();
  }
  stream.submit();
  const transaction = new Transaction();
  transaction.approve();
}
