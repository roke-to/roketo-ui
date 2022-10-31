import {test} from '../tests/fixtures/auth';
import {CreateStreamPage} from '../tests/pages/createstream.page';
import {MyStreamsPage} from '../tests/pages/mystreams.page';
import {TransactionPage} from '../tests/pages/transaction.page';
import {addFunds, checkAddFunds} from './shared/addFunds';
import {createCustomStream, createstream} from './shared/createstream';
import {login} from './shared/login';

test.beforeAll(async ({page, browser}) => {
  //const page = await browser.newPage(); //Create a new Page instance
  await login(page);
});

test('add funds', async ({accountId, page}) => {
  ///

  const comment = createComment('add funds');
  await createCustomStream({
    page,
    comment,
    period: {hours: '10'},
  });
  await addFunds('1', comment, page);
  await checkAddFunds('2', comment, page);
});

function createComment(testName: string) {
  const tag = Math.random().toString().slice(2, 8);
  const comment = `${testName} ${tag}`;
  return comment.slice(0, 60);
}
