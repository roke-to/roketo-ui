import SignInPage from './Login';
import { testSelectors } from '../../../src/shared/constants';
class HomePage {
  
  visit() {
    cy.visit('https://test.app-v2.roke.to/#/authorize');
  }
  
  checkPage(){
       cy.url().should('contains', 'https://test.app-v2.roke.to/');
  }
  goToSignIn() {
    cy.get(testSelectors.signInButton).click();

    const signPage = new SignInPage(); 
    return signPage;
  }
}

export default HomePage;