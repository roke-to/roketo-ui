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
      start: `You've successfully started a stream to ${receiverId}`,
      pause: `The stream to ${receiverId} is paused`,
      restart: `The stream to ${receiverId} was continued`,
      stop: `The stream to ${receiverId} has ended`,
    }[type];

    cy.get(testSelectors.notificationsContainer).contains(text);
  }

  checkReceiver(type, senderId) {
    const text = {
      start: `${senderId} started a stream for you to receive`,
      pause: `The stream from ${senderId} is paused`,
      restart: `${senderId} has continued the stream`,
      stop: `The stream from ${senderId} has ended`,
    }[type];

    cy.get(testSelectors.notificationsContainer).contains(text);
  }
}

export default Notifications;
