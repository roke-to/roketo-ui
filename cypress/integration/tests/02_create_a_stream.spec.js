/// <reference types="cypress" />

import CreateStream from '../../support/pages/CreateStream';
import Transaction from '../../support/pages/TransactionPage';
import MyStreams from '../../support/pages/MyStreams';
import { login } from '../../support/login';
context('Viewport', () => {
    beforeEach(() => {
        cy.visit('https://test.app-v2.roke.to/#/authorize')
      }
)
it('Create a stream without Autostart', () => {

    login();
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
})

it('Create a stream with Autostart', () => {

    login();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('10');
    stream.inputPeriod('10', '10', '10', '10');
    stream.inputComments('comment-comment');
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
})

})
