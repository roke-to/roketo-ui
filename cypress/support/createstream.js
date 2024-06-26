import CreateStream from './pages/CreateStream';
import Transaction from './pages/TransactionPage';

export function createstream({receiver = 'githubtest9.testnet', duration} = {}) {
  const stream = new CreateStream();
  stream.createStream();
  stream.inputReceiver(receiver);
  stream.inputDeposit('1');

  if (duration === 'short') {
    stream.inputPeriod('0m 0d 0h 1min');
  } else {
    stream.inputPeriod('35m 10d 10h 10min');
    stream.setDelayed();
    // stream.inputComments('comment-comment');
  }
  stream.submit();
  const transaction = new Transaction();
  transaction.approve();
}
