import { createstream } from '../../support/createstream';
import MyStreams from '../../support/pages/MyStreams';
import Transaction from '../../support/pages/TransactionPage';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';
context('Viewport', () => {
    beforeEach(() => {
        cy.visit('https://test.app-v2.roke.to/#/authorize')
      }
)
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


})
