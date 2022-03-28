/// <reference types="cypress" />

context('Viewport', () => {
  beforeEach(() => {
      cy.visit('https://test.app-v2.roke.to/#/authorize')
    }
)
it('login with Pass phrase', () => {
  cy.visit('https://test.app-v2.roke.to/#/authorize');
  cy.get('.h-screen').click();
  cy.get('.inline-flex').click();
  cy.wait(6000);
  //redirect to wallet
  cy.get('.buttons > .link').click({force: true});
  //cy.get('.account-selector > .gray-blue').click({force: true});
  cy.url().should('contains', 'https://wallet.testnet.near.org/recover-account');
  cy.get('[data-test-id="recoverAccountWithPassphraseButton"]').click();
  cy.get('input').click();
  cy.get('input').type('aunt service decline pelican actual kitchen size exhaust great prosper old attract');
  cy.get('#app-container').click();
  cy.get('.sc-bdvvtL').click();
  cy.wait(6000);
  cy.get('.blue').click();
  cy.wait(6000);
  cy.get('.button-group > .blue').click();
  cy.wait(6000);
  cy.url().should('contains', 'https://test.app-v2.roke.to/');
})
})
