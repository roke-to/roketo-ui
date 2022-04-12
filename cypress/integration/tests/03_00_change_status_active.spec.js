import { createstream } from '../../support/createstream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';

it('run stream', () => {
    //try drop previous session
    cy.wait(10000);
    relogin();
    createstream();
    const mystreams = new MyStreams();
    mystreams.changeStatus("start")
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('Active');
})



