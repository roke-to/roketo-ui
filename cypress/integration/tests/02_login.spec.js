/// <reference types="cypress" />
import SignInPage from './pages/Login';
import HomePage from './pages/HomePage';
context('Viewport', () => {
    beforeEach(() => {
        cy.visit('https://test.app-v2.roke.to/#/authorize')
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
    
    signPage.inputPassphrase('aunt service decline pelican actual kitchen size exhaust great prosper old attract');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    home.checkPage();
})

})
