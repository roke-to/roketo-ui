import {test} from '@playwright/test';

import {LoginPage} from '../pages/loginPage';
import {StreamingPage} from '../pages/streamingPage';
import {NearWallet} from '../shared/nearWallet';

test('Login', async ({page}) => {
  const loginPage = new LoginPage(page);
  const nearWallet = new NearWallet(page);
  const streamingPage = new StreamingPage(page);

  await loginPage.openLoginPage();
  await loginPage.clickSignIn();

  await nearWallet.checkIsRedirectedToNear();
  await nearWallet.loginToNear();

  await streamingPage.checkUrlIsStreaming();
});
