import { testSelectors } from '../../../src/shared/constants';

class HomePage {
  visit() {
    cy.visit('http://localhost:3000/#/authorize');
  }

  checkPage() {
    cy.url().should('contains', 'http://localhost:3000/');
  }

  goToSignIn() {
    cy.get(testSelectors.signInButton).click();
  }

  logout() {
    cy.get(testSelectors.signOutButton).click();
  }
}

export default HomePage;
