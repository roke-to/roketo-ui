import CreateStream from './pages/CreateStream';
import Transaction from './pages/TransactionPage';
import MyStreams from './pages/MyStreams';
// import { relogin } from './relogin';

export function createstream(testParams) {
    //relogin();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('10');
    stream.inputPeriod('10', '10', '10', '10');
    stream.inputComments('comment-comment');
    stream.uncheckAutostart();
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
}
