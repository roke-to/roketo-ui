import {expect, Page} from '@playwright/test';
import {string} from 'yup';

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

  async checknew(typeInput: string, receiverId: string) {
    let type = 'default';
    type = typeInput;
    // const text = {
    //   start: `You've successfully created a stream to ${receiverId}`,
    //   pause: `The stream to ${receiverId} is paused`,
    //   restart: `The stream to ${receiverId} was resumed`,
    //   stop: `The stream to ${receiverId} has completed`,
    //   cliff: `The stream to ${receiverId} has passed the cliff period`,
    //   funds: `The funds were added to the stream to ${receiverId}`,
    // }[type];

    switch (typeInput) {
      case 'start': {
        //statements;
        type = `You've successfully created a stream to ${receiverId}Total streaming amount: 1 NEARStream duration`;
        break;
      }
      case 'pause': {
        //statements;
        type = `The stream to ${receiverId} is paused`;
        break;
      }
      case 'restart': {
        //statements;
        type = `The stream to ${receiverId} was resumed`;
        break;
      }
      case 'stop': {
        //statements;
        type = `The stream to ${receiverId} has completed`;
        break;
      }
      case 'cliff': {
        //statements;
        type = `The stream to ${receiverId} has passed the cliff period`;
        break;
      }
      case 'funds': {
        //statements;
        type = `The funds were added to the stream to ${receiverId}`;
        break;
      }
      default: {
        //statements;
        type = `You've successfully created a stream to ${receiverId}`;
        break;
      }
    }

    //await expect(this.page.locator(testSelectors.notificationsContainer)).toHaveText?(text?.toString()):string;
    //  data-testid="notificationsContainer"
    await expect(
      this.page.locator('[data-testid="notificationsContainer"]>a').nth(0),
    ).toContainText(type);
  }

  async checkReceiver(type: string, senderId: string) {
    const text = {
      start: `${senderId} created a stream to you`,
      pause: `The stream from ${senderId} is paused`,
      restart: `${senderId} resumed the stream`,
      stop: `The stream from ${senderId} has completed`,
      cliff: `The stream from ${senderId} has passed the cliff period`,
      funds: `The funds were added to the stream from ${senderId}`,
      due: `The stream from ${senderId} was finished`,
    }[type];

    // await expect(this.page.locator(testSelectors.notificationsContainer)).toHaveText(text);
  }
}
