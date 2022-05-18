import MyStreams from '../../support/pages/MyStreams';
import  Notification from '../../support/pages/Notification';
import { login } from '../../support/login';
import Transaction from '../../support/pages/TransactionPage';
import { createstream } from '../../support/createstream';

it('Sender NotificationsCheck', () => {
    cy.viewport(1536, 960) ;
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
    cy.viewport(1536, 960) ;
    cy.wait(10000);
    login("receiver");
    const notif = new Notification();

    notif.openNotifications();
    notif.checkReceiver("start",3);
    notif.checkReceiver("pause",2);
    notif.checkReceiver("restart",1);
    notif.checkReceiver("stop",0);
})

