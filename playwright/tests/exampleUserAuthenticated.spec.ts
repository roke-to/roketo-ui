import {StreamingPage} from '../pages/streamingPage';
import {test} from '../shared/nearAuthecated';

/// This test isn't working yet, needs to be fixed
test('Do smth as authenticated user', async ({page}) => {
  const streamingPage = new StreamingPage(page);

  streamingPage.openStreamingPage();
  streamingPage.checkUrlIsStreaming();
  streamingPage.clickCreateStreamBtn();
  streamingPage.fillStreamRecieverData('delusion.testnet');
});
