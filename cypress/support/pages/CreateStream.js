class CreateStream{

    inputReciever(value){
        cy.get('.container').click();
        cy.get('[name="receiver"]').click();
        cy.get('[name="receiver"]').type(value);
    }

    inputDeposit(value){
        cy.get('[name="deposit"]').click();
        cy.get('[name="deposit"]').type('{backspace}');
        cy.get('[name="deposit"]').type(value);
    }

    inputPeriod(month, days, hours, mins){
        cy.get('.flex > .font-semibold').eq(1).click();
        cy.get('.flex > .font-semibold').eq(1).type('{backspace}');
        cy.get('.flex > .font-semibold').eq(1).type(month);
        //select days
        cy.get('.flex > .font-semibold').eq(2).click();
        cy.get('.flex > .font-semibold').eq(2).type('{backspace}');
        cy.get('.flex > .font-semibold').eq(2).type(days);
        //select hours
        cy.get('.flex > .font-semibold').eq(3).click();
        cy.get('.flex > .font-semibold').eq(3).type('{backspace}');
        cy.get('.flex > .font-semibold').eq(3).type(hours);
        //select mins
        cy.get('.flex > .font-semibold').eq(4).click();
        cy.get('.flex > .font-semibold').eq(4).type('{backspace}');
        cy.get('.flex > .font-semibold').eq(4).type(mins);
    }

    inputComments(value){
        cy.get('#commentInput').click();
        cy.get('#commentInput').type(value);
    }

    uncheckAutostart(){
        cy.get('[name="autoStart"]').click();
    }
    submit(){
        cy.get('[type="submit"]').click();
    }


}

export default CreateStream;