import MyStreams from './pages/MyStreams';
import Transaction from './pages/TransactionPage';

export function changestatus(testParams) {
    const mystreams = new MyStreams();
    mystreams.changeStatus(testParams)
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    if (testParams!=="stop"){
    mystreams.checkNewStreamStatus(testParams);
    }
}