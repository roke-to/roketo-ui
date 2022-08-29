import {test} from '../tests/fixtures/auth';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {NotificationPage} from '../tests/pages/notification.page';
import {TransactionPage} from '../tests/pages/transaction.page';

test('Sender NotificationsCheck', async ({page, accountId}) => {
  // login(receiver.seedPhrase);
  const notif = new NotificationPage(page);
  notif.openNotifications();
  notif.waitForInitialLoading();
  // logout();

  // login(sender.seedPhrase);
  // createstream({duration: 'short', receiver: receiver.accountId});
  const mystreams = new MyStreamsPage(page);
  // mystreams.checkNewStreamStatus('Active');

  notif.openNotifications();
  // notif.checknew('start', receiver.accountId);

  mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  transaction.approve();
  notif.openNotifications();
  // notif.checknew('pause', receiver.accountId);

  mystreams.changeStatus('start');
  transaction.approve();
  notif.openNotifications();
  // notif.checknew('restart', receiver.accountId);

  //add funds
  mystreams.addFunds(1);
  transaction.approve();
  notif.openNotifications();
  // notif.checknew('funds', receiver.accountId);

  mystreams.changeStatus('stop');
  transaction.approve();
  notif.openNotifications();
  // notif.checknew('stop', receiver.accountId);
});

test('Receiver NotificationsCheck', async ({page, accountId}) => {
  // login(receiver.seedPhrase);
  const notif = new NotificationPage(page);
  notif.openNotifications();
  // notif.checkReceiver('start', sender.accountId);
  // notif.checkReceiver('pause', sender.accountId);
  // notif.checkReceiver('restart', sender.accountId);
  // notif.checkReceiver('funds', sender.accountId);
  // notif.checkReceiver('stop', sender.accountId);
});
