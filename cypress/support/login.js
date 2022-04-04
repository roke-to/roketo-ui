/// <reference types="cypress" />
import SignInPage from '../integration/pages/Login'
import HomePage from '../integration/pages/HomePage';

export function login(testParams) {
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
    cy.wait(6000);
    home.checkPage();
}
