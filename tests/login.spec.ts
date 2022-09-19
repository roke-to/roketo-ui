import {test} from './fixtures/auth';
// import {test} from '@playwright/test';
import {HomePage} from './pages/home.page';
// import {NearWallet} from '../page-objects/near-wallet';
import {LoginPage} from './pages/login.page';
import {MyStreamsPage} from './pages/mystreams.page';

// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('login', async ({page}) => {
  const homePage = new HomePage(page);

  await homePage.visit();
  await homePage.checkPage();
  await homePage.goToSignIn();

  const signPage = new LoginPage(page);
  await Promise.all([page.waitForNavigation(), signPage.checkIsRedirectedToNear()]);
  // await signPage.loginNearAuthentificated();
  await signPage.loginToNear();

  const streamsPage = new MyStreamsPage(page);
  //await streamsPage.checkPage();
  await Promise.all([page.waitForNavigation()]);
  // await signPage.loginToNear();
  // await signPage.importExistingAccount(),
  // await signPage.chooseFirstAccount();
  // await signPage.submitButton();

  // await Promise.all([
  //   page.waitForNavigation(),
  //   signPage.recoverAccount(),
  // ]);

  // await Promise.all([
  //   page.waitForNavigation(),
  //   signPage.inputPassphrase("riot original quantum same result inner height lens erosion derive nurse ridge"),
  // ]);
  //   page.waitForNavigation();
  // signPage.recoverAccount();
  // page.waitForNavigation();
  // signPage.inputPassphrase("riot original quantum same result inner height lens erosion derive nurse ridge");
  // signPage.pressNext();
  // signPage.pressNext();
  // page.waitForNavigation();

  // homePage.checkPage();

  // const loginPage = new LoginPage(page);
  // const nearWallet = new NearWallet(page);
  // const navigate = new Navigate(page);

  // await loginPage.openLoginPage();
  // await loginPage.chooseNearWallet();

  // await nearWallet.checkIsRedirectedToNear();
  // await nearWallet.chooseFirstAccount();
  // await nearWallet.connectToNear();

  // await loginPage.checkUserLoggedIn(accountId);

  // await navigate.logout();
  // await loginPage.checkUserLoggedOut();
});
