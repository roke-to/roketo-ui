import { testSelectors } from '../../../src/shared/constants';

class Notifications {
  openNotifications() {
    cy.get(testSelectors.openNotificationsButton).click();
  }

  waitForInitialLoading() {
    cy.get(testSelectors.notificationsLoader).should('not.exist');
  }

  checknew(value, receiverId) {
    cy.get(testSelectors.notificationElement).eq(0)
      .find(testSelectors.notificationPrimaryCaption).eq(0)
      // .should(cb) callback function will be retried

      .should(($div) => {
        if (value === 'start') {
          expect($div).to.have.text(`You’ve successfully started a stream to ${receiverId}.`);
        }
        if (value === 'pause') {
          expect($div).to.have.text(`The stream to ${receiverId} is paused.`);
        }
        if (value === 'restart') {
          expect($div).to.have.text(`The stream to ${receiverId} was continued.`);
        }
        if (value === 'stop') {
          expect($div).to.have.text(`The stream to ${receiverId} has ended.`);
        }
      });
  }

  checkReceiver(value, order, senderId) {
    cy.get(testSelectors.notificationElement).eq(order)
      .find(testSelectors.notificationPrimaryCaption).eq(0)
      // .should(cb) callback function will be retried
      .should(($div) => {
        if (value === 'start') {
          expect($div).to.have.text(`${senderId} started a stream for you to receive.`);
        }
        if (value === 'pause') {
          expect($div).to.have.text(`The stream from ${senderId} is paused.`);
        }
        if (value === 'restart') {
          expect($div).to.have.text(`${senderId} has continued the stream.`);
        }
        if (value === 'stop') {
          expect($div).to.have.text(`The stream from ${senderId} has ended.`);
        }
      });
  }
}

export default Notifications;
