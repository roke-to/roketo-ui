import SignInPage from './pages/Login';
import HomePage from './pages/HomePage';
export function relogin() {
    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    cy.wait(6000);
    const signPage = new SignInPage(); 
    signPage.relogin();
    signPage.recoverAccount();
    signPage.inputPassphrase('decrease april mistake inch lizard riot detail curious invite tip remain fan');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
}
