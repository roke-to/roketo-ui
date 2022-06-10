import {createstream} from '../../support/createstream';
import {login} from '../../support/login';
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
    const notif = new Notification();
    notif.openNotifications();
    notif.waitForInitialLoading();
    logout();

    login(sender.seedPhrase);
    createstream({duration: 'short', receiver: receiver.accountId});
    const mystreams = new MyStreams();
    // mystreams.checkNewStreamStatus('Active');

    notif.openNotifications();
    notif.checknew('start', receiver.accountId);

    mystreams.changeStatus('pause');
    const transaction = new Transaction();
    transaction.approve();
    notif.openNotifications();
    notif.checknew('pause', receiver.accountId);

    mystreams.changeStatus('start');
    transaction.approve();
    notif.openNotifications();
    notif.checknew('restart', receiver.accountId);

    mystreams.changeStatus('stop');
    transaction.approve();
    notif.openNotifications();
    notif.checknew('stop', receiver.accountId);
  });

  it('Receiver NotificationsCheck', () => {
    cy.viewport(1536, 960);
    login(receiver.seedPhrase);
    const notif = new Notification();

    notif.openNotifications();
    notif.checkReceiver('start', sender.accountId);
    notif.checkReceiver('pause', sender.accountId);
    notif.checkReceiver('restart', sender.accountId);
    notif.checkReceiver('stop', sender.accountId);
  });
});
