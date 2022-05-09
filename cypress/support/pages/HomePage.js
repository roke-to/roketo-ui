import SignInPage from './Login';
import { testSelectors } from '../../../src/shared/constants';
class HomePage {
  
  visit() {
    cy.visit('https://app2.test.roke.to/#/authorize');
  }
  
  checkPage(){
       cy.url().should('contains', 'https://app2.test.roke.to/');
  }
  goToSignIn() {
    cy.get(testSelectors.signInButton).click();

    const signPage = new SignInPage(); 
    return signPage;
  }
}

export default HomePage;