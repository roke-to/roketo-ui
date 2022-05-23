import { testSelectors } from '../../../src/shared/constants';
class Stream{
   checkValues(){
    cy.get('.styles_link__24b3y').then(text => {
        let link = text.text();
        cy.wrap(link).as('link')
  
       cy.get('.authorization_logoutButton__2sCaP').click();
  
        cy.visit(link)
        cy.get(testSelectors.streamSenderCaption).should('have.text', 'githubtest11.testnet')
        cy.get(testSelectors.streamReceiverCaption).should('have.text', 'githubtest9.testnet')
        cy.get(testSelectors.streamTotalCaption).should('have.text', '1\u00a0wNEAR')
        cy.get(testSelectors.streamTokenCaption).should('have.text', 'Wrapped NEAR fungible token,\u00a0wNEAR')
      });
   }
}
export default Stream;