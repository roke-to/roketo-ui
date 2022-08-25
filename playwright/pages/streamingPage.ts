import {Page} from '@playwright/test';

export class StreamingPage {
  readonly page: Page;

  readonly elements = {
    streamingURL: '/#/streams',
    createStreamButton: '[data-testid="createStreamButton"]',
    createStreamReceiverInput: '[data-testid="createStreamReceiverInput"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async openStreamingPage() {
    await this.page.goto(this.elements.streamingURL);
  }

  async checkUrlIsStreaming() {
    await this.page.waitForURL(this.elements.streamingURL);
  }

  async clickCreateStreamBtn() {
    await this.page.locator(this.elements.createStreamButton).click();
  }

  async fillStreamRecieverData(recieverId: string) {
    await this.page.locator(this.elements.createStreamReceiverInput).type(recieverId);
  }
}
