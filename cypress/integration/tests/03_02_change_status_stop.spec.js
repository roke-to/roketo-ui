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
it('stop stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("stop");
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
})

})
