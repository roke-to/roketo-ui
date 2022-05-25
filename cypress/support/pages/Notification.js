import { testSelectors } from '../../../src/shared/constants';
import Transaction from './TransactionPage';

class Notifications {
  openNotifications() {
    cy.get(testSelectors.openNotificationsButton).click();
  }

  checknew(value) {
    cy.get(testSelectors.notificationElement).eq(0)
      .find(testSelectors.notificationPrimaryCaption).eq(0)
      // .should(cb) callback function will be retried

      .should(($div) => {
        if (value === 'start') {
          expect($div).to.have.text('You’ve successfully started a stream to githubtest9.testnet.');
        }
        if (value === 'pause') {
          expect($div).to.have.text('The stream to githubtest9.testnet is paused.');
        }
        if (value === 'restart') {
          expect($div).to.have.text('The stream to githubtest9.testnet was continued.');
        }
        if (value === 'stop') {
          expect($div).to.have.text('The stream to githubtest9.testnet has ended.');
        }
      });
  }

  checkReceiver(value,order) {
    cy.get(testSelectors.notificationElement).eq(order)
      .find(testSelectors.notificationPrimaryCaption).eq(0)
      // .should(cb) callback function will be retried
      .should(($div) => {
        if (value === 'start') {
          expect($div).to.have.text('githubtest11.testnet started a stream for you to receive.');
        }
        if (value === 'pause') {
          expect($div).to.have.text('The stream from githubtest11.testnet is paused.');
        }
        if (value === 'restart') {
          expect($div).to.have.text('githubtest11.testnet has continued the stream.');
        }
        if (value === 'stop') {
          expect($div).to.have.text('The stream from githubtest11.testnet has ended.');
        }
      });
  }
}

export default Notifications;
