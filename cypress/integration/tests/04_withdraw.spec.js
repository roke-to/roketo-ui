import MyStreams from '../../support/pages/MyStreams';
import { login } from '../../support/login';
import { createstream } from '../../support/createstream';
it('withdraw all before test', () => {
    cy.wait(10000);
    login("receiver");
    cy.wait(10000);
    const mystreams = new MyStreams();
    mystreams.getPage();
    mystreams.withdraw();
})
it('create stream', () => {
    cy.viewport(1536, 960) ;
    cy.wait(10000);
    login();
    createstream("short");
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
})
it('not empty withdraw', () => {
    login("receiver");
    cy.wait(10000);
    const mystreams = new MyStreams();
    cy.wait(6000);
    mystreams.getPage();
    mystreams.checkwithdraw("full");
    mystreams.withdrawFirst();
})
it('empty withdraw', () => {
    login("receiver");
    cy.wait(10000);
    const mystreams = new MyStreams();
    mystreams.getPage();
    mystreams.checkwithdraw("empty");
})