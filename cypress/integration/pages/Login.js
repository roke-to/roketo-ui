class SignInPage {

  importExistingAccount() {
    cy.get('.buttons > .link').click({force: true});
  }

  recoverAccount() {
    cy.get('[data-test-id="recoverAccountWithPassphraseButton"]').click();
    //param by attr
  }

  inputPassphrase(value) {
    cy.get('input').click();
    cy.get('input').type(value);
    cy.get('[data-test-id="seedPhraseRecoverySubmitButton"]').click();
  }

  pressNext() {
    //cy.get('.sc-bdvvtL.gXRoeR.blue').click();
    // cy.click() failed because this element is detached from the DOM.
    cy.get('.button-group > .blue').click();
  }

  //the same as pressNext
  // confirmLogin(){
  //   cy.get('.button-group > .blue').click();
  // }

}
export default SignInPage;