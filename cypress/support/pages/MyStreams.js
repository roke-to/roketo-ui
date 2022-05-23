import { testSelectors } from '../../../src/shared/constants';
import Transaction from './TransactionPage';
class MyStreams{


    openStream(){
      cy.get('.styles_flexCenter__B0Jt1').eq(0).click();
    }
    checkNewStreamStatus(value){
          cy.wait(3000);
          cy.get(testSelectors.streamControlsDropdown).then(($Dropdown) => {
                cy.get('.styles_statusPadded__3UL71').eq(0).should("have.text", value);
           })
    }

    changeStatus(value){
        if (value === "start"){
            cy.get(testSelectors.streamStartButton).eq(0).click({force: true})
        }
        if (value === "pause"){
            cy.get(testSelectors.streamPauseButton).eq(0).click({force: true})
        }
        if (value === "stop"){
            cy.get(testSelectors.streamStopButton).eq(0).click({force: true})
            cy.get('.styles_modalButton__uHmah').eq(1).click();
        }

    }
    getPage(){
        cy.visit('http://localhost:3000/#/streams');
    }

    withdraw(){
        cy.wait(6000);
         cy.get(testSelectors.withdrawAllButton).click({force: true});
         cy.wait(6000);
        cy.get('body').then(($body) => {
            if ($body.text().includes('Approve Transaction')) {
                const transaction = new Transaction();
                transaction.approve();
                cy.wait(6000);
            }

        })
    }

    checkwithdraw(value){
        cy.get(testSelectors.withdrawAllButton).trigger("mouseover");
        if (value === "full"){ 
            cy.get('body').then(($body) => {
                if ($body.text().includes('You have nothing to withdraw')) {
                    throw new Error("test fails here")
                } })

        } else { //if empty
            cy.get('body').then(($body) => {
                if ($body.text().includes('You have nothing to withdraw')) {
                } else {
                    throw new Error("test fails here")
            }})
        }
    }

    withdrawFirst(){
        cy.get(testSelectors.withdrawButton).eq(0).click({force: true});
        cy.wait(6000);
        cy.get('body').then(($body) => {
            if ($body.text().includes('Approve Transaction')) {
                const transaction = new Transaction();
                transaction.approve();
                cy.wait(6000);
            }else{
                throw new Error("test fails here")
            }

        })
    }
}

export default MyStreams;