import {createstream} from '../../support/createstream';
import {login, waitForBackendAuth} from '../../support/login';
import {logout} from '../../support/logout';
import MyStreams from '../../support/pages/MyStreams';
import Notification from '../../support/pages/Notification';
import Transaction from '../../support/pages/TransactionPage';

context('Notifications', () => {
  let sender;
  let receiver;

  before(() => {
    cy.task('getAccount').then((freshTestAccount) => (sender = freshTestAccount));
    cy.task('getAccount', {filename: 'anotherTestAccount'}).then(
      (anotherFreshTestAccount) => (receiver = anotherFreshTestAccount),
    );
  });

  it('Sender NotificationsCheck', () => {
    cy.viewport(1536, 960);

    login(receiver.seedPhrase);
    waitForBackendAuth();
    logout();

    login(sender.seedPhrase);
    waitForBackendAuth();
    createstream({duration: 'short', receiver: receiver.accountId});
    const mystreams = new MyStreams();
    // mystreams.checkNewStreamStatus('Active');

    const notif = new Notification();
    notif.toggleNotifications();
    notif.checknew('start', receiver.accountId);

    mystreams.changeStatus('pause');
    const transaction = new Transaction();
    transaction.approve();
    notif.toggleNotifications();
    notif.checknew('pause', receiver.accountId);

    mystreams.changeStatus('start');
    transaction.approve();
    notif.toggleNotifications();
    notif.checknew('restart', receiver.accountId);

    //add funds
    mystreams.addFunds(1);
    transaction.approve();
    notif.toggleNotifications();
    notif.checknew('funds', receiver.accountId);

    mystreams.changeStatus('stop');
    transaction.approve();
    notif.toggleNotifications();
    notif.checknew('stop', receiver.accountId);
  });

  it('Receiver NotificationsCheck', () => {
    cy.viewport(1536, 960);
    login(receiver.seedPhrase);
    const notif = new Notification();

    notif.toggleNotifications();
    notif.checkReceiver('start', sender.accountId);
    notif.checkReceiver('pause', sender.accountId);
    notif.checkReceiver('restart', sender.accountId);
    notif.checkReceiver('funds', sender.accountId);
    notif.checkReceiver('stop', sender.accountId);
  });
});
