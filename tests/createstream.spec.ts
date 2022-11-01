import {Page} from '@playwright/test';

import {testSelectors} from '../src/shared/constants';
import {test} from '../tests/fixtures/auth';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {HomePage} from '../tests/pages/home.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
// import {NearWallet} from '../page-objects/near-wallet';
import {LoginPage} from './pages/login.page';
import {changeStreamStatus} from './shared/changeStreamStatus';
import {checkStreamStatus} from './shared/checkStreamStatus';
import {createCustomStream, createstream} from './shared/createstream';
import {login} from './shared/login';

// let page: Page; //create variable with page
// test.beforeAll(async ({browser}) => {
//   page = await browser.newPage(); //Create a new Page instance
// });
test.beforeAll(async ({page, browser}) => {
  //const page = await browser.newPage(); //Create a new Page instance
  await login(page);
});

//test('Create uneditable stream', async ({accountId, page}) => {
//   login(account.seedPhrase);
// await login(page);

//  const comment = createComment('uneditable stream');
//  await createCustomStream({
//    page,
//    comment,
//    period: {month: '30', days: '10', hours: '10', mins: '10'},
//    uneditable: true,
//  });
//  const mystreams = new MyStreamsPage(page);
//  await mystreams.checkIfLastStreamLocked(comment, page);
//});

test('Create a delayed stream', async ({accountId, page}) => {
  // await login(page);
  const comment = createComment('delayed stream');
  await createCustomStream({
    page,
    comment,
    period: {month: '30', days: '10', hours: '10', mins: '10'},
    delayed: true,
  });
  await checkStreamStatus('Initialized', comment, page);
});

test('Create a stream with cliff', async ({accountId, page}) => {
  // await login(page);
  const comment = createComment('stream with cliff');
  await createCustomStream({
    page,
    comment,
    period: {month: '30', days: '10', hours: '10', mins: '10'},
    cliff: true,
  });
  await checkStreamStatus('Active', comment, page);
});
// cy.task('getAccount').then((testAccount) => (account = testAccount));
test('Create a non-delayed stream', async ({accountId, page}) => {
  // await login(page);
  const comment = createComment('non-delayed stream');
  console.log('create stream', comment);
  await createstream(page, 'delusion.testnet', 'long', comment);
  await page.locator(testSelectors.streamListLoader).waitFor({state: 'detached'});
  await changeStreamStatus('start', comment, page);
  await checkStreamStatus('Active', comment, page);
});

function createComment(testName: string) {
  const tag = Math.random().toString().slice(2, 8);
  const comment = `${testName} ${tag}`;
  return comment.slice(0, 60);
}
