import SignInPage from './Login';

class HomePage {
  
  visit() {
    cy.visit('https://test.app-v2.roke.to/#/authorize');
  }
  
  checkPage(){
       cy.url().should('contains', 'http:///test.app-v2.roke.to/');
  }
  goToSignIn() {
    cy.get('.inline-flex').click();

    const signPage = new SignInPage(); 
    return signPage;
  }
}

export default HomePage;