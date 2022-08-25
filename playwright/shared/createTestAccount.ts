import {connect, keyStores, utils} from 'near-api-js';
import {generateSeedPhrase} from 'near-seed-phrase';

// remove generated from filename so it'll be checked in unused exports
export async function createTestAccount() {
  const randomNumber = Math.floor(
    Math.random() * (99999999999999 - 10000000000000) + 10000000000000,
  );

  const accountId = `roketo-${Date.now()}-${randomNumber}`;

  const {seedPhrase, publicKey} = generateSeedPhrase();
  const broswerLocalStorageKey = new keyStores.InMemoryKeyStore();

  const near = await connect({
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    keyStore: broswerLocalStorageKey,
    headers: {},
  });

  await near.accountCreator.createAccount(accountId, utils.PublicKey.from(publicKey));

  return {
    accountId,
    seedPhrase,
  };
}
