import MyStreams from './pages/MyStreams';

export function changestatus(value) {
    const mystreams = new MyStreams();
    mystreams.changeStatus(value)
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    if (value!="stop"){
    mystreams.checkNewStreamStatus(value);
    }
}