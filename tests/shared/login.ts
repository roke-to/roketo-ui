import {Page} from '@playwright/test';

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
