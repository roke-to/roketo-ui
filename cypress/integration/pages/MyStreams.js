class MyStreams{
    checkNewStreamStatus(value){
    cy.get('.text-special-active').eq(0).should("have.text", value);
    }
}

export default MyStreams;