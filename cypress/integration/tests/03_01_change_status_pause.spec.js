import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';

it('pause stream', () => {
    cy.wait(20000);
    login();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("pause")
    cy.wait(10000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    mystreams.checkNewStreamStatus('Paused');
})


