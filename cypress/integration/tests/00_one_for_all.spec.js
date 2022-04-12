import SignInPage from '../../support/pages/Login';
import HomePage from '../../support/pages/HomePage';
import CreateStream from '../../support/pages/CreateStream';
import Transaction from '../../support/pages/TransactionPage';
import MyStreams from '../../support/pages/MyStreams';
import { login } from '../../support/login';
import { relogin } from '../../support/relogin';



it('login with Pass phrase', () => {

    const home = new HomePage();
    home.visit();
    home.checkPage();
    home.goToSignIn();
    cy.wait(6000);
    //redirect to wallet
    const signPage = new SignInPage(); 
    signPage.firstImportExistingAccount();
    signPage.recoverAccount();
    signPage.inputPassphrase('churn glance express exclude guess account wheel earn forget include kitchen hockey');
    cy.wait(15000);
    signPage.pressNext();
    cy.wait(6000);
    signPage.pressNext();
    cy.wait(6000);
    home.checkPage();
})
it('Create a stream without Autostart', () => {
    //try drop previous session
    cy.wait(10000);
    relogin();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('10');
    stream.inputPeriod('10', '10', '10', '10');
    stream.inputComments('comment-comment');
    stream.uncheckAutostart();
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Initialized');
})

it('Create a stream with Autostart', () => {

    relogin();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
    stream.inputComments('comment-comment');
    stream.submit();
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(20000);
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
})
it('pause stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("pause")
    cy.wait(10000);
    const  transaction = new Transaction();
    transaction.approve();
    cy.wait(10000);
    mystreams.checkNewStreamStatus('Pause');
})
it('stop stream', () => {
    cy.wait(20000);
    relogin();
    const mystreams = new MyStreams();
    mystreams.getPage();
    cy.wait(20000);
    mystreams.changeStatus("stop");
    cy.wait(5000);
    const  transaction = new Transaction();
    transaction.approve();
})
