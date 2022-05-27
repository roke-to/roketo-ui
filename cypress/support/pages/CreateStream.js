import { testSelectors } from '../../../src/shared/constants';

class CreateStream {
  createStream() {
    cy.get(testSelectors.createStreamButton).click();
  }

  inputReceiver(value) {
    cy.get(testSelectors.createStreamReceiverInput)
      .click()
      .click()
      .type(value);
  }

  inputDeposit(value) {
    cy.get(testSelectors.createStreamAmountInput)
      .click()
      .type(' {backspace}')
      .type(value);
  }

  inputPeriod(month, days, hours, mins) {
    if (month !== '0') {
      cy.get(testSelectors.createStreamMonthsInput)
        .click()
        .type(' {backspace}')
        .type(month);
    }
    //select days
    if (days !== '0') {
      cy.get(testSelectors.createStreamDaysInput)
        .click()
        .type(' {backspace}')
        .type(days);
    }
    //select hours
    if (hours !== '0') {
      cy.get(testSelectors.createStreamHoursInput)
        .click()
        .type(' {backspace}')
        .type(hours);
    }
    //select mins
    cy.get(testSelectors.createStreamMinutesInput)
      .click()
      .type(' {backspace}')
      .type(mins);
  }

  inputComments(value) {
    cy.get(testSelectors.createStreamCommentInput)
      .click()
      .type(value);
  }

  uncheckAutostart() {
    cy.get(testSelectors.createStreamAutostartCheckbox).click();
  }

  submit() {
    cy.get(testSelectors.createStreamSubmitButton).click();
  }
}

export default CreateStream;
