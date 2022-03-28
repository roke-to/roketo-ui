/// <reference types="cypress" />
// untitled.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
context('Viewport', () => {
    beforeEach(() => {
        cy.visit('https://test.app-v2.roke.to/#/authorize')
      }
)
it('displays two todo items by default', () => {
    cy.visit('https://test.app-v2.roke.to/#/authorize');
    cy.get('.h-screen').click();
    cy.get('.inline-flex').click();
    //cy.url().should('contains', 'https://wallet.testnet.near.org/login/');
    cy.wait(6000);
    cy.get('.blue').click();
    //cy.contains('Next').rightclick();
    cy.wait(6000);
    cy.get('#app-container').click();
    cy.get('.blue').click();
    cy.wait(6000);
    //cy.contains('Connect').rightclick();
    cy.url().should('contains', 'https://test.app-v2.roke.to/');
  })
})
