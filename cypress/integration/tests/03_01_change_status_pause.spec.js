import { createstream } from '../../support/createstream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';

it('pause stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("pause")
    cy.wait(10000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('Pause');
})


