import { testSelectors } from '../../../src/shared/constants';
import Transaction from './TransactionPage';

class MyStreams {
  checkNewStreamStatus(value) {
    cy.get(testSelectors.streamControlsDropdown).then(() => {
      cy.get('.styles_statusPadded__3UL71').eq(0).should('have.text', value);
    })
  }

  changeStatus(value) {
    if (value === 'start') {
      cy.get(testSelectors.streamStartButton).eq(0).click( {force: true})
    }
    if (value === 'pause') {
      cy.get(testSelectors.streamPauseButton).eq(0).click( {force: true})
    }
    if (value === 'stop') {
      cy.get(testSelectors.streamStopButton).eq(0).click( {force: true})
      cy.get('.styles_modalButton__uHmah').eq(1).click();
    }
  }

  visit() {
    cy.visit('http://localhost:3000/#/streams');
  }

  checkPage() {
    cy.url().contains('http://localhost:3000/#/streams', { timeout: 20000 });
  }

  withdraw() {
    cy.get(testSelectors.withdrawAllButton).trigger('mouseover');
    cy.get(testSelectors.withdrawLoadingCaption).should('not.exist');
    cy.get('body').then(($body) => {
      if (!$body.text().includes('You have nothing to withdraw')) {
        cy.get(testSelectors.withdrawAllButton).click( {force: true});
        const transaction = new Transaction();
        transaction.checkPage();
        transaction.approve();
      }
    });
  }

  checkwithdraw(shouldBeEmpty) {
    cy.get(testSelectors.withdrawAllButton).trigger('mouseover');
    cy.get(testSelectors.withdrawLoadingCaption).should('not.exist');
    cy.get(testSelectors.withdrawTooltip).then(($tooltip) => {
      const isEmpty = $tooltip.text().includes('You have nothing to withdraw');
      if (isEmpty !== shouldBeEmpty) {
        throw new Error(
          (shouldBeEmpty
              ? 'There shouldn\'t have been anything for withdrawal, but there was '
              : 'There should have been something for withdrawal, but there was '
          ) + ' ' + $tooltip.text()
        );
      }
    });
  }

  waitUntilDue() {
    // RegExp to catch "1 of 1" only and not "0.251 of 1".
    cy.get(testSelectors.streamProgressCaption).eq(0).contains(/\b1 of 1\b/, { timeout: 60000 });
  }

  withdrawFirst() {
    cy.get(testSelectors.withdrawButton).eq(0).click( {force: true});

    const transaction = new Transaction();
    transaction.checkPage();
    transaction.approve();

    cy.url().should('contains', 'http://localhost:3000/#/streams');
  }
}

export default MyStreams;
