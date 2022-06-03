import {createstream} from '../../support/createstream';
import {login} from '../../support/login';
import MyStreams from '../../support/pages/MyStreams';

context('Withdraw', () => {
  let sender;
  let receiver;

  before(() => {
    cy.task('getAccount').then((testAccount) => (sender = testAccount));
    cy.task('getAccount', {filename: 'anotherTestAccount'}).then(
      (anotherTestAccount) => (receiver = anotherTestAccount),
    );
  });

  it('withdraw all before test', () => {
    login(receiver.seedPhrase);
    const mystreams = new MyStreams();
    mystreams.withdraw();
    const SHOULD_BE_EMPTY = true;
    mystreams.checkwithdraw(SHOULD_BE_EMPTY);
  });

  it('create stream', () => {
    cy.viewport(1536, 960);
    login(sender.seedPhrase);
    createstream({duration: 'short', receiver: receiver.accountId});
    const mystreams = new MyStreams();
    mystreams.checkNewStreamStatus('Active');
  });

  it('not empty withdraw', () => {
    login(receiver.seedPhrase);
    const mystreams = new MyStreams();
    const SHOULD_NOT_BE_EMPTY = false;
    mystreams.checkwithdraw(SHOULD_NOT_BE_EMPTY);
    mystreams.waitUntilDue();
    mystreams.withdrawFirst();
  });

  it('empty withdraw', () => {
    login(receiver.seedPhrase);
    const mystreams = new MyStreams();
    const SHOULD_BE_EMPTY = true;
    mystreams.checkwithdraw(SHOULD_BE_EMPTY);
  });
});
