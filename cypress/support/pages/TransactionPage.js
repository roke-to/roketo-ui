class Transaction {
  approve() {
    cy.get('.button-group > .blue').click();
  }

  cancel() {
    cy.get('.button-group > .grey-blue').click();
  }
}

export default Transaction;
