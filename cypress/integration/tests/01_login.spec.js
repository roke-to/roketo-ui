import SignInPage from '../../support/pages/Login';
import HomePage from '../../support/pages/HomePage';

context('Viewport', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/authorize')
      }
)
it('login with Pass phrase', () => {

    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    cy.wait(6000);
    //redirect to wallet
    const signPage = new SignInPage(); 
    signPage.importExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase('accuse night project february offer fresh belt orbit rather battle zoo amused');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
})

})
