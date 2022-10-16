import {Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';
import {HomePage} from '../pages/home.page';
// import {NearWallet} from '../page-objects/near-wallet';
import {LoginPage} from '../pages/login.page';

// import {MyStreamsPage} from '../pages/mystreams.page';

export async function login(page: Page) {
  const homePage = new HomePage(page);

  await homePage.visit();
  await homePage.checkPage();
  await homePage.goToSignIn();

  const signPage = new LoginPage(page);
  await Promise.all([page.waitForNavigation(), signPage.checkIsRedirectedToNear()]);
  await signPage.loginNearAuthentificated();
  // await signPage.loginToNear();

  // const streamsPage = new MyStreamsPage(page);
  await Promise.all([page.waitForNavigation()]);
  // await streamsPage.checkPage();
}

export async function login2(page: Page, phrase: string) {
  if ((await page.locator(testSelectors.signOutButton).count()) > 0) {
    await page.locator(testSelectors.signOutButton).click();
  }
  const homePage = new HomePage(page);

  await homePage.visit();
  await homePage.checkPage();
  await homePage.goToSignIn();

  const signPage = new LoginPage(page);
  await Promise.all([page.waitForNavigation({timeout: 60000}), signPage.checkIsRedirectedToNear()]);

  // await signPage.loginNearAuthentificated();
  // await signPage.loginToNear();
  // await signPage.loginToNear();

  await Promise.all([page.waitForNavigation({timeout: 60000}), signPage.importExistingAccount()]);

  // await signPage.chooseFirstAccount();
  // await signPage.submitButton();

  await Promise.all([page.waitForNavigation({timeout: 60000}), signPage.recoverAccount()]);

  await Promise.all([page.waitForNavigation({timeout: 60000}), signPage.inputPassphrase(phrase)]);

  signPage.pressNext();
  signPage.pressNext();
  page.waitForNavigation();

  // const streamsPage = new MyStreamsPage(page);
  // await Promise.all([page.waitForNavigation()]);
  // await streamsPage.checkPage();
}

export async function login3(page: Page) {
  if ((await page.locator(testSelectors.signOutButton).count()) > 0) {
    await page.locator(testSelectors.signOutButton).click();
  }

  const homePage = new HomePage(page);

  await homePage.visit();
  await homePage.checkPage();
  await homePage.goToSignIn();

  const signPage = new LoginPage(page);
  await Promise.all([page.waitForNavigation({timeout: 60000}), signPage.checkIsRedirectedToNear()]);
  await signPage.loginNearAuthentificatedReceiver();
  // await signPage.loginToNear();

  // const streamsPage = new MyStreamsPage(page);
  await Promise.all([page.waitForNavigation({timeout: 60000})]);
  // await streamsPage.checkPage();
}
