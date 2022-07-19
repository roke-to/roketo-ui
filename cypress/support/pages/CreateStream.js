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

  inputPeriod(month, days, hours, mins) {
    if (month !== '0') {
      cy.get(testSelectors.createStreamMonthsInput).click().type(' {backspace}').type(month);
    }
    // select days
    if (days !== '0') {
      cy.get(testSelectors.createStreamDaysInput).click().type(' {backspace}').type(days);
    }
    // select hours
    if (hours !== '0') {
      cy.get(testSelectors.createStreamHoursInput).click().type(' {backspace}').type(hours);
    }
    // select mins
    cy.get(testSelectors.createStreamMinutesInput).click().type(' {backspace}').type(mins);
  }

  inputCliffPeriod(month, days, hours, mins, sec, period) {
    cy.get('[aria-label="Month"]').click().type(month);
    cy.get('[aria-label="Day"]').click().type(days);
    cy.get('[aria-label="Year"]').click().type(' {backspace}').type(2022);
    cy.get('[aria-label="Hour"]').click().type(hours);
    cy.get('[aria-label="Minute"]').click().type(mins);
    cy.get('[aria-label="Second"]').click().type(' {backspace}').type(sec);
    cy.get('[aria-label="Select AM/PM"]').select(period);
  }

  inputComments(value) {
    cy.get(testSelectors.createStreamCommentInput).click().type(value);
  }

  setDelayed() {
    cy.get(testSelectors.createStreamDelayedCheckbox).click();
  }

  submit() {
    cy.get(testSelectors.createStreamSubmitButton).click();
  }

  uneditable() {
    cy.get(testSelectors.createStreamLockedCheckbox).click();
  }
}

export default CreateStream;
