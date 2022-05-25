import SignInPage from '../../support/pages/Login';
import HomePage from '../../support/pages/HomePage';

context('Login', () => {
  let account;

  before(() => {
    cy.task('getAccount').then((testAccount) => account = testAccount);
  });

  it('login with Pass phrase', () => {
    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    //redirect to wallet
    const signPage = new SignInPage();
    signPage.checkPage();
    signPage.importExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase(account.seedPhrase);
    signPage.pressNext();
    signPage.pressNext();
    home.checkPage();
  });
});
