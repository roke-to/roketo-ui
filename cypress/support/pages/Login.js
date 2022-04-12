class SignInPage {

  // relogin(){
  //   cy.get('.account-selector > .gray-blue').click({force: true});
  // }

  checkPage(){
    cy.url().should('contains', 'https://wallet.testnet.near.org/login/');
  }

  importExistingAccount() {
    cy.get('button').then(($button) => {
    if ($button.text().includes('Import a Different Account')) {
      cy.get('.account-selector > .gray-blue').click({force: true});
   } else {
       cy.get('.buttons > .link').click({force: true});
   }})
  }

  // importExistingAccount() {
  //   cy.get('.account-selector > .gray-blue').click({force: true});
  // }

  recoverAccount() {
    cy.get('[data-test-id="recoverAccountWithPassphraseButton"]').click();
  }

  inputPassphrase(value) {
    cy.get('input').click();
    cy.get('input').type(value);
    cy.get('[data-test-id="seedPhraseRecoverySubmitButton"]').click();
  }

  pressNext() {
    cy.get('.button-group > .blue').click();
  }

}
export default SignInPage;