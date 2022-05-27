import { generateSeedPhrase } from 'near-seed-phrase';
import { connect, utils } from 'near-api-js';

export async function createTestAccount() {
  const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);

  const accountId = `roketo-${Date.now()}-${randomNumber}`;

  const { seedPhrase, publicKey } = generateSeedPhrase();

  const near = await connect({
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    helperAccount: 'testnet',
    explorerUrl: 'https://explorer.testnet.near.org',
    keyStore: 'no',
  });

  await near.accountCreator.createAccount(accountId, utils.PublicKey.from(publicKey));

  return {
    accountId,
    seedPhrase,
  };
}
