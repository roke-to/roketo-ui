import { createstream } from '../../support/createstream';

import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { createstream } from '../../support/createstream';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';

it('run stream', () => {
    login();
    createstream();
    const mystreams = new MyStreams();
    mystreams.changeStatus("start")
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('start');
})
it('pause stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    mystreams.changeStatus("pause")
    cy.wait(10000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('Pause');
})
it('stop stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    mystreams.changeStatus("stop");
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
})
