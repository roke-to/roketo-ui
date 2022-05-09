import { testSelectors } from '../../../src/shared/constants';
class CreateStream{
    createStream(){
        cy.get(testSelectors.createStreamButton).click();
    }

    inputReciever(value){
        cy.get(testSelectors.createStreamReceiverInput).click();
        cy.get(testSelectors.createStreamReceiverInput).click();
        cy.get(testSelectors.createStreamReceiverInput).type(value);
    }

    inputDeposit(value){
        cy.get(testSelectors.createStreamAmountInput).click();
        cy.get(testSelectors.createStreamAmountInput).type('{backspace}');
        cy.get(testSelectors.createStreamAmountInput).type(value);
    }

    inputPeriod(month, days, hours, mins){
        cy.get(testSelectors.createStreamMonthsInput).click();
        cy.get(testSelectors.createStreamMonthsInput).type('{backspace}');
        cy.get(testSelectors.createStreamMonthsInput).type(month);
        //select days
        cy.get(testSelectors.createStreamDaysInput).click();
        cy.get(testSelectors.createStreamDaysInput).type('{backspace}');
        cy.get(testSelectors.createStreamDaysInput).type(days);
        //select hours
        cy.get(testSelectors.createStreamHoursInput).click();
        cy.get(testSelectors.createStreamHoursInput).type('{backspace}');
        cy.get(testSelectors.createStreamHoursInput).type(hours);
        //select mins
        cy.get(testSelectors.createStreamMinutesInput).click();
        cy.get(testSelectors.createStreamMinutesInput).type('{backspace}');
        cy.get(testSelectors.createStreamMinutesInput).type(mins);
    }

    inputComments(value){
        cy.get(testSelectors.createStreamCommentInput).click();
        cy.get(testSelectors.createStreamCommentInput).type(value);
    }

    uncheckAutostart(){
        cy.get(testSelectors.createStreamAutostartCheckbox).click();
    }
    submit(){
        cy.get(testSelectors.createStreamSubmitButton).click();
    }


}

export default CreateStream;