class Transaction {
  checkPage() {
    cy.url().should('contains', 'https://wallet.testnet.near.org/sign');
  }

  approve() {
    cy.get('.button-group > .blue').click();
    cy.contains('Sending', {timeout: 60000}).should('not.exist');
  }

  cancel() {
    cy.get('.button-group > .grey-blue').click();
  }
}

export default Transaction;
