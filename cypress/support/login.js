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
    if(testParams==="receiver"){
        signPage.inputPassphrase('defense plunge barrel space suspect safe yard minimum shrimp broccoli scrub assume');
    }else{
        signPage.inputPassphrase('accuse night project february offer fresh belt orbit rather battle zoo amused');
    }
    cy.wait(20000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
}
