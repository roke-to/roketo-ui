import SignInPage from '../../support/pages/Login';
import HomePage from '../../support/pages/HomePage';
import CreateStream from '../../support/pages/CreateStream';
import Transaction from '../../support/pages/TransactionPage';
import MyStreams from '../../support/pages/MyStreams';
import { login } from '../../support/login';
import { createstream } from '../../support/createstream';
import  Notification from '../../support/pages/Notification';
import Stream from '../../support/pages/Stream';

context('Viewport', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/authorize');
        cy.viewport(1536, 960);
      }
)
it('login with Pass phrase', () => {

    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    cy.wait(6000);
    //redirect to wallet
    const signPage = new SignInPage(); 
    signPage.importExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase('twin rebel deliver duck leaf absorb solution permit quantum wasp habit crawl');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
})


it('Create a stream without Autostart', () => {
    
    cy.wait(10000);
    login();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    //stream.inputComments('comment-comment');
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
})

it('Create a stream with Autostart', () => {
    cy.wait(10000);
    login();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    //stream.inputComments('comment-comment');
    stream.checkAutostart();
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
})
it('run stream', () => {

    cy.wait(10000);
    login();
    createstream();

    const mystreams = new MyStreams();
    mystreams.changeStatus("start")
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('Active');
})
it('pause stream', () => {

    cy.wait(20000);
    login();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("pause")
    cy.wait(10000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    mystreams.checkNewStreamStatus('Paused');
})
it('stop stream', () => {

    cy.wait(20000);
    login();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("stop");
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
})
it('withdraw all before test', () => {
    cy.wait(10000);
    login("receiver");
    cy.wait(10000);
    const mystreams = new MyStreams();
    mystreams.getPage();
    mystreams.withdraw();
})
it('create stream', () => {

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

it('Sender NotificationsCheck', () => {

    cy.wait(10000);
    login();
    createstream("short");
     const mystreams = new MyStreams();
    // mystreams.checkNewStreamStatus('Active');
    const notif = new Notification();

    notif.openNotifications();
    notif.checknew("start");
    
    mystreams.changeStatus("pause")
    const  transaction = new Transaction();
    transaction.approve();
    notif.openNotifications();
    notif.checknew("pause");


    mystreams.changeStatus("start")
    transaction.approve();
    notif.openNotifications();
    notif.checknew("restart");

    mystreams.changeStatus("stop")
    transaction.approve();
    notif.openNotifications();
    notif.checknew("stop");
})

it('Reciever NotificationsCheck', () => {

    cy.wait(10000);
    login("receiver");
    const notif = new Notification();

    notif.openNotifications();
    notif.checkReceiver("start",3);
    notif.checkReceiver("pause",2);
    notif.checkReceiver("restart",1);
    notif.checkReceiver("stop",0);
})
it('Anon check', ()=>{
    cy.wait(10000);
    login();
    createstream("short");
    const mystream = new MyStreams();
    mystream.openStream();
    const stream = new Stream();
    stream.checkValues();
});
})