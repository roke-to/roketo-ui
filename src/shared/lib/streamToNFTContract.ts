import {isWNearTokenId} from '@roketo/sdk';
import {FTContract, TransactionMediator} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';
import {utils} from 'near-api-js';

import {env} from '~/shared/config';

const GAS_SIZE = '200000000000000';
const STORAGE_DEPOSIT = '0.0025';

type VaultTransferType = {
  owner_id: string;
  amount: string | number | BigNumber;
  transactionMediator: TransactionMediator;
  tokenContract: FTContract;
  tokenAccountId: string;
  nftId: string;
  nftContractId: string;
  wNearId: string;
};

type StorageDepositType = {
  tokenContract: any;
  storageDepositAccountIds: any;
};

const isRegistered = async ({
  accountId,
  tokenContract,
}: {
  accountId: string;
  tokenContract: FTContract;
}) => {
  const res = await tokenContract.storage_balance_of({
    account_id: accountId,
  });
  return res && res.total !== '0';
};

const countStorageDeposit = async ({
  tokenContract,
  storageDepositAccountIds,
}: StorageDepositType) => {
  const allAccountIds = [...storageDepositAccountIds];
  const isRegisteredAccountIds = await Promise.all(
    allAccountIds.map((accountId) =>
      isRegistered({
        accountId,
        tokenContract,
      }),
    ),
  );
  let depositSum = new BigNumber(0);
  /** account creation costs 0.0025 NEAR for storage */

  const depositAmount = utils.format.parseNearAmount(STORAGE_DEPOSIT);

  allAccountIds.forEach((accountId, index) => {
    if (!isRegisteredAccountIds[index]) depositSum = depositSum.plus(depositAmount || 0);
  });

  return {
    isRegisteredAccountIds,
    depositSum,
    depositAmount: depositAmount || '',
  };
};

export const createChangeFunctionCall = (
  mediator: any,
  methodName: any,
  args: any,
  gas: any,
  deposit: any,
) =>
  mediator.signAndSendTransaction({
    receiverId: env.ROKETO_VAULT_CONTRACT_NAME,
    actions: [mediator.functionCall(methodName, args, gas, deposit)],
  });

export const withdrawNFT = ({
  nftContractId,
  nftId,
  fungibleToken,
  transactionMediator,
}: {
  nftContractId: string;
  nftId: string;
  fungibleToken: string;
  transactionMediator: any;
}) =>
  createChangeFunctionCall(
    transactionMediator,
    'withdraw',
    {
      nft_contract_id: nftContractId,
      nft_id: nftId,
      fungible_token: fungibleToken,
    },
    GAS_SIZE,
    '1',
  );

export const vaultTransfer = async ({
  owner_id,
  amount,
  transactionMediator,
  tokenContract,
  tokenAccountId,
  nftId,
  nftContractId,
  wNearId,
}: VaultTransferType) => {
  const storageDepositAccountIds = [owner_id];

  const {isRegisteredAccountIds, depositSum, depositAmount} = await countStorageDeposit({
    tokenContract,
    storageDepositAccountIds,
  });

  const actions = [
    transactionMediator.functionCall(
      'ft_transfer_call',
      {
        receiver_id: env.ROKETO_VAULT_CONTRACT_NAME,
        amount: new BigNumber(amount).toFixed(0),
        msg: JSON.stringify({
          nft_id: nftId,
          nft_contract_id: nftContractId,
          kind: 'TopUp',
        }),
      },
      '100000000000000',
      '1',
    ),
  ];

  storageDepositAccountIds.forEach((accountId, index) => {
    if (!isRegisteredAccountIds[index]) {
      actions.unshift(
        transactionMediator.functionCall(
          'storage_deposit',
          {
            account_id: accountId,
            registration_only: true,
          },
          '30000000000000',
          depositAmount,
        ),
      );
    }
  });

  if (
    isWNearTokenId({
      tokenAccountId,
      wNearId,
    })
  ) {
    actions.unshift(
      transactionMediator.functionCall(
        'near_deposit',
        {},
        '30000000000000',
        new BigNumber(amount).plus(depositSum).toFixed(0),
      ),
    );
  }

  return transactionMediator.signAndSendTransaction({
    receiverId: tokenAccountId,
    actions,
  });
};

export const parseNftContract = (description: string) => {
  let nftId = '';
  let nftContractId = '';

  try {
    const parsedDescription = JSON.parse(JSON.parse(`"${description}"`));
    nftId = parsedDescription.nft_id; // eslint-disable-next-line no-empty
    nftContractId = parsedDescription.nft_contract_id; // eslint-disable-next-line no-empty
  } catch {}

  return {nftId, nftContractId};
};
