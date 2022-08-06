/* eslint-disable import/no-unresolved, import/extensions */
import {testSelectors} from '../../../src/shared/constants';

class CreateStream {
  createStream() {
    cy.get(testSelectors.createStreamButton).click();
  }

  inputReceiver(value) {
    cy.get(testSelectors.createStreamReceiverInput).click().click().type(value);
  }

  inputDeposit(value) {
    cy.get(testSelectors.createStreamAmountInput).click().type(' {backspace}').type(value);
  }

  inputPeriod(value) {
    cy.get(testSelectors.createStreamDurationInput).click().type(' {backspace}').type(value);
  }

  inputCliffPeriod() {
    const currentTimeInMilliseconds = new Date();
    cy.get('[aria-label="Month"]').click().type(currentTimeInMilliseconds.getMonth());
    cy.get('[aria-label="Day"]').click().type(currentTimeInMilliseconds.getDay());
    cy.get('[aria-label="Year"]')
      .click()
      .type(' {backspace}')
      .type(currentTimeInMilliseconds.getFullYear() + 1);
    cy.get('[aria-label="Hour"]').click().type(currentTimeInMilliseconds.getHours());
    cy.get('[aria-label="Minute"]').click().type(currentTimeInMilliseconds.getMinutes());
    cy.get('[aria-label="Second"]').click().type(' {backspace}').type(1);
    cy.get('[aria-label="Select AM/PM"]').select('AM');
  }

  inputComments(value) {
    cy.get(testSelectors.createStreamCommentInput).click().type(value);
  }

  setDelayed() {
    cy.get(testSelectors.createStreamDelayedCheckbox).click({force: true});
  }

  submit() {
    cy.get(testSelectors.createStreamSubmitButton).click();
  }

  uneditable() {
    cy.get(testSelectors.createStreamLockedCheckbox).click();
  }
}

export default CreateStream;
