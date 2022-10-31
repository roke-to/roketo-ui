import {Page} from '@playwright/test';

import {testSelectors} from '../src/shared/constants';
import {test} from '../tests/fixtures/auth';
import {testReceiver} from '../tests/fixtures/auth-as-receiver';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {NotificationPage} from '../tests/pages/notification.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {accountId, seedPhrase} from './fixtures/rec.json';
import {changeStreamStatus} from './shared/changeStreamStatus';
import {checkStreamStatus} from './shared/checkStreamStatus';
import {createCustomStream, createstream} from './shared/createstream';
import {login, login2} from './shared/login';

// let page: Page; //create variable with page
test.beforeAll(async ({page, browser}) => {
  //const page = await browser.newPage(); //Create a new Page instance
  await login(page);
});

test('pause stream', async ({accountId, page}) => {
  // await login(page);
  const comment = createComment('pause stream');
  await createCustomStream({
    page,
    comment,
    period: {hours: '10'},
  });
  await changeStreamStatus('pause', comment, page);
  await checkStreamStatus('Paused', comment, page);
});

test('stop stream', async ({accountId, page}) => {
  // await login(page);
  const mystreams = new MyStreamsPage(page);
  await mystreams.changeStatus('stop');
  const transaction = new TransactionPage(page);
  await transaction.approve();
  await mystreams.checkStreamDoesntExist();
});

function createComment(testName: string) {
  const tag = Math.random().toString().slice(2, 8);
  const comment = `${testName} ${tag}`;
  return comment.slice(0, 60);
}
