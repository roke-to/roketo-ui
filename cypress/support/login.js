import SignInPage from './pages/Login';
import HomePage from './pages/HomePage';

export function login(testParams) {
    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    cy.wait(6000);
    const signPage = new SignInPage(); 
    signPage.importExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase('winner scrub fan text ramp wage volcano old quiz key crucial oil');
    cy.wait(20000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
}