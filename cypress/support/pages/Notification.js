/* eslint-disable import/no-unresolved, import/extensions */
import {testSelectors} from '../../../src/shared/constants';

class Notifications {
  openNotifications() {
    cy.get(testSelectors.openNotificationsButton).click();
  }

  waitForInitialLoading() {
    cy.get(testSelectors.notificationsLoader).should('not.exist');
  }

  checknew(type, receiverId) {
    const text = {
      start: `You’ve successfully started a stream to ${receiverId}.`,
      pause: `The stream to ${receiverId} is paused.`,
      restart: `The stream to ${receiverId} was continued.`,
      stop: `The stream to ${receiverId} has ended.`,
    }[type];

    cy.get(testSelectors.notificationElement)
      .eq(0)
      .find(testSelectors.notificationPrimaryCaption)
      .eq(0)
      .contains(text);
  }

  checkReceiver(type, order, senderId) {
    const text = {
      start: `${senderId} started a stream for you to receive.`,
      pause: `The stream from ${senderId} is paused.`,
      restart: `${senderId} has continued the stream.`,
      stop: `The stream from ${senderId} has ended.`,
    }[type];

    cy.get(testSelectors.notificationElement)
      .eq(order)
      .find(testSelectors.notificationPrimaryCaption)
      .eq(0)
      .contains(text);
  }
}

export default Notifications;
