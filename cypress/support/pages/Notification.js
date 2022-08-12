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
      start: `You've successfully created a stream to ${receiverId}`,
      pause: `The stream to ${receiverId} is paused`,
      restart: `The stream to ${receiverId} was resumed`,
      stop: `The stream to ${receiverId} has completed`,
      cliff: `The stream to ${receiverId} has passed the cliff period`,
      funds: `The funds were added to the stream to ${receiverId}`,
    }[type];

    cy.get(testSelectors.notificationsContainer).contains(text);
  }

  checkReceiver(type, senderId) {
    const text = {
      start: `${senderId} created a stream to you`,
      pause: `The stream from ${senderId} is paused`,
      restart: `${senderId} resumed the stream`,
      stop: `The stream from ${senderId} has completed`,
      cliff: `The stream from ${senderId} has passed the cliff period`,
      funds: `The funds were added to the stream from ${senderId}`,
      due: `The stream from ${senderId} was finished`,
    }[type];

    cy.get(testSelectors.notificationsContainer).contains(text);
  }
}

export default Notifications;
