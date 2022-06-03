import MyStreams from './pages/MyStreams';
import Transaction from './pages/TransactionPage';

export function changestatus(testParams) {
  const mystreams = new MyStreams();
  mystreams.changeStatus(testParams);
  const transaction = new Transaction();
  transaction.approve();
  if (testParams !== 'stop') {
    mystreams.checkNewStreamStatus(testParams);
  }
}
