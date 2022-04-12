import SignInPage from '../../support/pages/Login';
import HomePage from '../../support/pages/HomePage';
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
    signPage.firstImportExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase('decrease april mistake inch lizard riot detail curious invite tip remain fan');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
})

})
