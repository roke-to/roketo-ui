import {isWNearTokenId} from '@roketo/sdk';
import {
  FTContract,
  RoketoContract,
  RoketoStream,
  TransactionMediator, // RoketoContract
} from '@roketo/sdk/dist/types';
import {BigNumber} from 'bignumber.js';
import {Contract, utils} from 'near-api-js';

import {env} from '~/shared/config';

// const GAS_SIZE = '200000000000000';
const GAS_SIZE = '300000000000000';
const STORAGE_DEPOSIT = '0.0025';
type StringInt = string;
type StreamId = string;
type TokenAmount = {
  [tokenAccountId: string]: StringInt;
};
type RoketoAccount = {
  active_incoming_streams: number;
  active_outgoing_streams: number;
  deposit: StringInt;
  inactive_incoming_streams: number;
  inactive_outgoing_streams: number;
  is_cron_allowed: boolean;
  last_created_stream: StreamId;
  stake: StringInt;
  total_incoming: TokenAmount;
  total_outgoing: TokenAmount;
  total_received: TokenAmount;
  args?: any;
};
type ContractChangeFunctionArgs<P> = {
  args: P;
  gas: string;
  amount: string;
  callbackUrl?: string;
};
type ContractResponse<R> = R & {
  Err: never;
  Ok: R;
};
type ContractViewFunction<P, R> = (json?: P) => Promise<R>;
type ContractChangeFunction<P> = (
  json: P | ContractChangeFunctionArgs<P>,
  gasSize?: string,
  deposit?: string,
) => Promise<void>;
type StreamsProps = {
  account_id: string;
  from: number;
  limit: number;
};
type AccountFTResponse = [total_incoming: string, total_outgoing: string, total_received: string];
export type StreamToNFTContract = RoketoContract & {
  replenishers: ContractViewFunction<
    {
      nft_contract_id: string;
      nft_id: string;
    },
    ContractResponse<RoketoAccount[]>
  >;
  get_account: ContractViewFunction<
    {
      account_id: string;
    },
    ContractResponse<RoketoAccount>
  >;
  get_stream: ContractViewFunction<
    {
      stream_id: string;
    },
    ContractResponse<RoketoStream>
  >;
  get_account_incoming_streams: ContractViewFunction<
    StreamsProps,
    ContractResponse<RoketoStream[]>
  >;
  get_account_outgoing_streams: ContractViewFunction<
    StreamsProps,
    ContractResponse<RoketoStream[]>
  >;
  get_account_ft: ContractViewFunction<
    {
      account_id: string;
      token_account_id: string;
    },
    ContractResponse<AccountFTResponse>
  >;
  withdraw: ContractChangeFunction<{
    stream_ids: string[];
  }>;
  start_stream: ContractChangeFunction<{
    stream_id: string;
  }>;
  pause_stream: ContractChangeFunction<{
    stream_id: string;
  }>;
  stop_stream: ContractChangeFunction<{
    stream_id: string;
  }>;
};

type Create = {
  owner_id: string;
  amount: string | number | BigNumber;
  transactionMediator: TransactionMediator;
  tokenContract: FTContract;
  tokenAccountId: string;
  nftId: string;
  nftContractId: string;
  wNearId: string;
};

type VaultTransferType = {
  owner_id: string;
  amount: string | number | BigNumber;
  transactionMediator: TransactionMediator;
  tokenContract: FTContract;
  tokenAccountId: string;
  msg: any;
  contractName: string;
  wNearId: string;
};

type GetStreamsType = {
  from: number;
  limit: number;
  contract: RoketoContract;
  accountId: string;
};

type GetIncomingStreamsType = {
  account: any;
  nftContractId: string;
  nftId: string;
  roketoContract: RoketoContract;
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

export const vaultTransfer = async ({
  owner_id,
  amount,
  transactionMediator,
  tokenContract,
  tokenAccountId,
  contractName,
  wNearId,
  msg,
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
        receiver_id: contractName,
        amount: new BigNumber(amount).toFixed(0),
        msg,
      },
      '250000000000000',
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

export const getOutgoingStreamsToNFT = async ({
  from,
  limit,
  contract,
  accountId,
}: GetStreamsType): Promise<RoketoStream[]> => {
  const outgoingStreams = contract
    .get_account_outgoing_streams({
      account_id: accountId,
      from,
      limit,
    })
    .catch(() => []);
  return outgoingStreams;
};

export const getIncomingStreamsToNFT = async ({
  account,
  nftContractId,
  nftId,
  roketoContract,
}: GetIncomingStreamsType) => {
  console.log('getIncomingStreamsToNFT');
  const contract = new Contract(account, env.ROKETO_VAULT_CONTRACT_NAME, {
    viewMethods: ['replenishers'],
    changeMethods: [],
  }) as StreamToNFTContract;

  const [replenishers] = await contract.replenishers({
    nft_contract_id: nftContractId,
    nft_id: nftId,
  });

  const streamId = JSON.parse(replenishers.args).stream_id;

  const incomingStreams = await roketoContract.get_stream({
    stream_id: streamId,
  });
  return incomingStreams;
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
  fungibleToken?: string;
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

export const withdrawAllNFT = ({
  nftContractId,
  nftId,
  transactionMediator,
}: {
  nftContractId: string;
  nftId: string;
  transactionMediator: any;
}) =>
  createChangeFunctionCall(
    transactionMediator,
    'withdraw_all',
    {
      nft_contract_id: nftContractId,
      nft_id: nftId,
    },
    GAS_SIZE,
    '1',
  );

export const createStreamToNFT = ({
  deposit,
  tokenAccountId,
  commissionOnCreate,
  tokensPerSec,
  delayed = false,
  nftId,
  nftContractId,
  accountId,
  tokenContract,
  transactionMediator,
  wNearId,
}: {
  comment: string;
  deposit: string;
  commissionOnCreate: string;
  receiverId: string;
  tokenAccountId: string;
  tokensPerSec: string;
  name?: string;
  cliffPeriodSec?: number;
  delayed?: boolean;
  isExpirable?: boolean;
  isLocked?: boolean;
  color: string | null;
  nftId: string;
  nftContractId: string;
  accountId: string;
  tokenContract: FTContract;
  transactionMediator: TransactionMediator;
  wNearId: string;
}) => {
  const totalAmount = new BigNumber(deposit).plus(commissionOnCreate).toFixed(0);
  const VaultRequest = {
    nft_id: nftId,
    nft_contract_id: nftContractId,
    kind: 'Transfer',
  };

  const request = {
    owner_id: accountId,
    receiver_id: env.ROKETO_VAULT_CONTRACT_NAME,
    tokens_per_sec: tokensPerSec,
    is_auto_start_enabled: !delayed,
  };

  const withdrawArgs = {
    stream_id: '',
    msg: JSON.stringify({...VaultRequest}),
  };

  const vaultArgs = {
    nft_contract_id: nftContractId,
    nft_id: nftId,
    callback: 'withdraw_call',
    args: JSON.stringify({...withdrawArgs}),
    deposit: '1',
  };

  const msg = JSON.stringify({
    CreateCall: {
      request,
      contract: env.ROKETO_VAULT_CONTRACT_NAME,
      call: 'add_replenishment_callback',
      args: JSON.stringify({...vaultArgs}),
    },
  });

  return vaultTransfer({
    owner_id: accountId,
    msg,
    amount: totalAmount,
    tokenContract,
    tokenAccountId,
    transactionMediator,
    contractName: env.STREAM_TO_NFT_CONTRACT_NAME,
    wNearId,
  });
};

export const createTransferToNFT = ({
  owner_id,
  amount,
  transactionMediator,
  tokenContract,
  tokenAccountId,
  nftId,
  nftContractId,
  wNearId,
}: Create) => {
  const msg = JSON.stringify({
    nft_id: nftId,
    nft_contract_id: nftContractId,
    kind: 'TopUp',
  });

  return vaultTransfer({
    msg,
    owner_id,
    amount,
    tokenContract,
    tokenAccountId,
    transactionMediator,
    contractName: env.ROKETO_VAULT_CONTRACT_NAME,
    wNearId,
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
