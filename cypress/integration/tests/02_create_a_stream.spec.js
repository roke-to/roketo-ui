import CreateStream from '../../support/pages/CreateStream';
import Transaction from '../../support/pages/TransactionPage';
import MyStreams from '../../support/pages/MyStreams';
import { login } from '../../support/login';

it('Create a stream without Autostart', () => {
    cy.viewport(1536, 960) ;
    cy.wait(10000);
    login();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.createStream();
    stream.inputReciever('delusion.testnet');
    stream.inputDeposit('1');
    stream.inputPeriod('1000', '10', '10', '10');
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
    cy.viewport(1536, 960) ;
    cy.wait(10000);
    login();
    cy.wait(3000);
    const stream = new CreateStream();
    stream.createStream();
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

