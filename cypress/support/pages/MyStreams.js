class MyStreams{
    checkNewStreamStatus(value){
          cy.get('.text-special-active').eq(0).should("have.text", value);

    }
    changeStatus(value){
        //cy.get('.text-special-active').eq(0).click();
        if ((value == "start")||(value == "pause")){
            cy.get('.px-5:nth-child(1) > .inline-flex > span').eq(0).click({force: true});
        } else { //if stop
            cy.get('.px-5:nth-child(3) > .inline-flex > span').eq(0).click({force: true});
        }

    }
    getPage(){
        cy.visit('https://test.app-v2.roke.to/#/streams');
    }

    withdraw(){
        cy.get('.Button--main').click();
    }
}

export default MyStreams;