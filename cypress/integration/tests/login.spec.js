/// <reference types="cypress" />
// login.spec.js created with Cypress
//
context('Viewport', () => {
    beforeEach(() => {
        cy.visit('https://test.app-v2.roke.to/#/authorize')
      }
)
it('displays two todo items by default', () => {
    cy.visit('https://test.app-v2.roke.to/#/authorize');
    cy.get('.h-screen').click();
    cy.get('.inline-flex').click();
    cy.url().should('contains', 'https://wallet.testnet.near.org/login/');
    
  })
})
