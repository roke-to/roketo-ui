import HomePage from './pages/HomePage';
import SignInPage from './pages/Login';

export function login(seedPhrase) {
  const home = new HomePage();
  home.visit();
  home.checkPage();
  home.goToSignIn();
  const signPage = new SignInPage();
  signPage.checkPage();
  signPage.importExistingAccount();
  signPage.recoverAccount();
  signPage.inputPassphrase(seedPhrase);
  signPage.pressNext();
  signPage.pressNext();
  home.checkPage();
}
