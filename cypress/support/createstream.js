import CreateStream from './pages/CreateStream';
import Transaction from './pages/TransactionPage';
import MyStreams from './pages/MyStreams';

export function createstream(testParams) {
    cy.wait(3000);
    const stream = new CreateStream();
    stream.inputReciever('githubtest4.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    stream.inputComments('comment-comment');
    stream.uncheckAutostart();
    stream.submit();
    const transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
}
