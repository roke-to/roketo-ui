import {expect, Page} from '@playwright/test';

import {testSelectors} from '../../src/shared/constants';

export class NotificationPage {
  readonly page: Page;

  readonly elements = {
    chooseDaoURL: '/dao',
    dashboardPageURL: '/dashboard',
    treasuryPageURL: '/treasury',
    myStreamsURL: '#/streams',
    buttonSelectDao: 'button:has-text("Select DAO")',
    buttonNearWallet: 'button:has-text("NEAR Wallet")',
    accountId: '[data-qa="account"]',
    ////
  };

  constructor(page: Page) {
    this.page = page;
  }

  async openNotifications() {
    await this.page.locator(testSelectors.openNotificationsButton).click();
  }

  async waitForInitialLoading() {
    await expect(this.page.locator(testSelectors.notificationsLoader)).toHaveCount(0);
  }

  async checknew(type, receiverId) {
    const text = {
      start: `You've successfully created a stream to ${receiverId}`,
      pause: `The stream to ${receiverId} is paused`,
      restart: `The stream to ${receiverId} was resumed`,
      stop: `The stream to ${receiverId} has completed`,
      cliff: `The stream to ${receiverId} has passed the cliff period`,
      funds: `The funds were added to the stream to ${receiverId}`,
    }[type];

    await expect(this.page.locator(testSelectors.notificationsContainer)).toHaveText(text);
  }

  async checkReceiver(type, senderId) {
    const text = {
      start: `${senderId} created a stream to you`,
      pause: `The stream from ${senderId} is paused`,
      restart: `${senderId} resumed the stream`,
      stop: `The stream from ${senderId} has completed`,
      cliff: `The stream from ${senderId} has passed the cliff period`,
      funds: `The funds were added to the stream from ${senderId}`,
      due: `The stream from ${senderId} was finished`,
    }[type];

    await expect(this.page.locator(testSelectors.notificationsContainer)).toHaveText(text);
  }
}
