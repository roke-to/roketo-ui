import {test} from '../tests/fixtures/auth';
import {test_receiver} from '../tests/fixtures/auth-as-receiver';
import '../tests/fixtures/rec.json';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {NotificationPage} from '../tests/pages/notification.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {createstream} from './shared/createstream';
import {login} from './shared/login';

test('Sender NotificationsCheck', async ({page, accountId}) => {
  await login(page);
  //  var arrg = JSON.parse();
  await createstream(page, 'playwright3.testnet', 'short');
  const notif = new NotificationPage(page);
  //await notif.openNotifications();
  await notif.waitForInitialLoading();
  // logout();

  // login(sender.seedPhrase);
  // createstream({duration: 'short', receiver: receiver.accountId});
  const mystreams = new MyStreamsPage(page);
  // mystreams.checkNewStreamStatus('Active');

  await notif.openNotifications();
  await notif.checknew('start', 'playwright3.testnet');
  //await notif.checknew('start', 'delusion.testnet');

  await mystreams.changeStatus('pause');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('pause', 'playwright3.testnet');
  //await notif.checknew('pause', 'delusion.testnet');
  await mystreams.changeStatus('start');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('restart', 'playwright3.testnet');
  // await notif.checknew('restart', 'delusion.testnet');

  //add funds
  await mystreams.addFunds('1');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('funds', 'playwright3.testnet');

  await mystreams.changeStatus('stop');
  await transaction.approve();
  await notif.openNotifications();
  await notif.checknew('stop', 'playwright3.testnet');
});

// test('Receiver NotificationsCheck', async ({page_rec, accountRecId}) => {
//   // login(receiver.seedPhrase);
//   const notif = new NotificationPage(page);
//   notif.openNotifications();
//   // notif.checkReceiver('start', sender.accountId);
//   // notif.checkReceiver('pause', sender.accountId);
//   // notif.checkReceiver('restart', sender.accountId);
//   // notif.checkReceiver('funds', sender.accountId);
//   // notif.checkReceiver('stop', sender.accountId);
// });
