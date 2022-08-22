import {BigNumber} from 'bignumber.js';
import {Account, Contract, utils} from 'near-api-js';

import {env, GAS_SIZE} from '~/shared/config';
import {isWNearTokenId} from '~/shared/lib/isWNearTokenId';

import {STORAGE_DEPOSIT} from './roketo/constants';
import type {RoketoContract} from './roketo/interfaces/contracts';
import type {
  RoketoAccount,
  RoketoDao,
  RoketoStream,
  RoketoTokenMeta,
} from './roketo/interfaces/entities';
import type {ApiControl, FTContract, RichToken, TransactionMediator} from './types';

export async function initApiControl({
  account,
  transactionMediator,
}: {
  account: Account;
  transactionMediator: TransactionMediator;
}): Promise<ApiControl> {
  const {accountId} = account;
  const contract = createRoketoContract({account});
  const [roketoAccount, dao] = await Promise.all([
    getAccount({contract, accountId}),
    getDao({contract}),
  ]);
  const richTokens = await createRichContracts({
    account,
    tokensInfo: Object.entries(dao.tokens),
    dao,
  });
  return {
    account,
    accountId,
    contract,
    roketoAccount,
    dao,
    tokens: richTokens,
    transactionMediator,
  };
}

export async function createRichContracts({
  account,
  tokensInfo,
  dao,
}: {
  account: Account;
  tokensInfo: Array<readonly [tokenAccountId: string, roketoMeta: RoketoTokenMeta]>;
  dao: RoketoDao;
}): Promise<{
  [tokenId: string]: RichToken;
}> {
  const {accountId} = account;
  return Object.fromEntries(
    await Promise.all(
      tokensInfo.map(async ([tokenAccountId, roketoMeta]) => {
        const tokenContract = createTokenContract({account, tokenAccountId});
        const [meta, balance] = await Promise.all([
          getTokenMetadata({tokenContract}),
          getBalance({accountId, tokenContract}),
        ]);

        const commission = roketoMeta.is_payment
          ? roketoMeta.commission_on_create
          : dao.commission_non_payment_ft;

        return [
          tokenAccountId,
          {
            roketoMeta,
            meta,
            balance,
            tokenContract,
            commission,
          },
        ];
      }),
    ),
  );
}

function createTokenContract({
  account,
  tokenAccountId,
}: {
  account: Account;
  tokenAccountId: string;
}) {
  return new Contract(account, tokenAccountId, {
    viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
    changeMethods: ['ft_transfer_call', 'storage_deposit', 'near_deposit'],
  }) as FTContract;
}

function createRoketoContract({account}: {account: Account}) {
  return new Contract(account, env.ROKETO_CONTRACT_NAME, {
    viewMethods: [
      'get_stats',
      'get_dao',
      'get_token',
      'get_stream',
      'get_account',
      'get_account_incoming_streams',
      'get_account_outgoing_streams',
      'get_account_ft',
    ],
    changeMethods: ['start_stream', 'pause_stream', 'stop_stream', 'withdraw'],
  }) as RoketoContract;
}

async function isRegistered({
  accountId,
  tokenContract,
}: {
  accountId: string;
  tokenContract: FTContract;
}) {
  const res = await tokenContract.storage_balance_of({account_id: accountId});
  return res && res.total !== '0';
}

function getTokenMetadata({tokenContract}: {tokenContract: FTContract}) {
  return tokenContract.ft_metadata();
}

async function getBalance({
  accountId,
  tokenContract,
}: {
  accountId: string | null | void;
  tokenContract: FTContract;
}) {
  if (!accountId) return '0';
  return tokenContract.ft_balance_of({account_id: accountId});
}

export function addFunds({
  amount,
  streamId,
  callbackUrl,
  tokenAccountId,
  transactionMediator,
}: {
  /** amount is in yocto */
  amount: string;
  streamId: string;
  callbackUrl: string;
  tokenAccountId: string;
  transactionMediator: TransactionMediator;
}) {
  const actions = [
    transactionMediator.functionCall(
      'ft_transfer_call',
      {
        receiver_id: env.ROKETO_CONTRACT_NAME,
        amount,
        memo: 'Roketo transfer',
        msg: JSON.stringify({
          Deposit: {
            stream_id: streamId,
          },
        }),
      },
      '100000000000000',
      '1',
    ),
  ];
  if (isWNearTokenId(tokenAccountId)) {
    actions.unshift(transactionMediator.functionCall('near_deposit', {}, '30000000000000', amount));
  }
  return transactionMediator.signAndSendTransaction({
    receiverId: tokenAccountId,
    walletCallbackUrl: callbackUrl,
    actions,
  });
}

export async function transfer({
  payload,
  amount,
  callbackUrl,
  tokenContract,
  tokenAccountId,
  transactionMediator,
}: {
  payload: {
    description?: string;
    owner_id: string;
    receiver_id: string;
    balance: string;
    tokens_per_sec: string;
    cliff_period_sec?: number;
    is_auto_start_enabled?: boolean;
    is_expirable?: boolean;
    is_locked?: boolean;
  };
  amount: string;
  callbackUrl?: string;
  tokenContract: FTContract;
  tokenAccountId: string;
  transactionMediator: TransactionMediator;
}) {
  const storageDepositAccountIds = [payload.owner_id, payload.receiver_id];

  const {isRegisteredAccountIds, depositSum, depositAmount} = await countStorageDeposit({
    tokenContract,
    storageDepositAccountIds,
  });

  const actions = [
    transactionMediator.functionCall(
      'ft_transfer_call',
      {
        receiver_id: env.ROKETO_CONTRACT_NAME,
        amount: new BigNumber(amount).toFixed(),
        memo: 'Roketo transfer',
        msg: JSON.stringify({
          Create: {
            request: payload,
          },
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
          {account_id: accountId},
          '30000000000000',
          depositAmount,
        ),
      );
    }
  });

  if (isWNearTokenId(tokenAccountId)) {
    actions.unshift(
      transactionMediator.functionCall(
        'near_deposit',
        {},
        '30000000000000',
        new BigNumber(amount).plus(depositSum).toFixed(),
      ),
    );
  }

  return transactionMediator.signAndSendTransaction({
    receiverId: tokenAccountId,
    walletCallbackUrl: callbackUrl,
    actions,
  });
}

export async function countStorageDeposit({
  tokenContract,
  storageDepositAccountIds,
}: {
  tokenContract: FTContract;
  storageDepositAccountIds: Array<string>;
}) {
  const rocetoAccountIds = [env.ROKETO_CONTRACT_NAME, env.ROKETO_FINANCE_CONTRACT_NAME];

  storageDepositAccountIds.push(...rocetoAccountIds);

  const isRegisteredAccountIds = await Promise.all(
    storageDepositAccountIds.map((accountId) => isRegistered({accountId, tokenContract})),
  );

  let depositSum = new BigNumber(0);
  /** account creation costs 0.0025 NEAR for storage */
  const depositAmount = utils.format.parseNearAmount(STORAGE_DEPOSIT)!;

  storageDepositAccountIds.forEach((accountId, index) => {
    if (!isRegisteredAccountIds[index]) depositSum = depositSum.plus(depositAmount);
  });

  return {
    isRegisteredAccountIds,
    depositSum,
    depositAmount,
  };
}

async function getAccount({
  contract,
  accountId,
}: {
  contract: RoketoContract;
  accountId?: string | null | void;
}): Promise<RoketoAccount> {
  const emptyAccount = {
    active_incoming_streams: 0,
    active_outgoing_streams: 0,
    deposit: '0',
    inactive_incoming_streams: 0,
    inactive_outgoing_streams: 0,
    is_cron_allowed: true,
    last_created_stream: 'any',
    stake: '0',
    total_incoming: {},
    total_outgoing: {},
    total_received: {},
  };
  if (!accountId) return emptyAccount;
  return contract.get_account({account_id: accountId}).catch(() => emptyAccount);
}

export function getDao({contract}: {contract: RoketoContract}) {
  return contract.get_dao();
}

export function getStream({streamId, contract}: {streamId: string; contract: RoketoContract}) {
  return contract.get_stream({stream_id: streamId});
}

function createChangeFunctionCall(
  mediator: TransactionMediator,
  methodName: string,
  args: object | Uint8Array,
  gas: string,
  deposit: string,
) {
  return mediator.signAndSendTransaction({
    receiverId: env.ROKETO_CONTRACT_NAME,
    actions: [mediator.functionCall(methodName, args, gas, deposit)],
  });
}

export function startStream({
  streamId,
  transactionMediator,
}: {
  streamId: string;
  transactionMediator: TransactionMediator;
}) {
  return createChangeFunctionCall(
    transactionMediator,
    'start_stream',
    {stream_id: streamId},
    GAS_SIZE,
    '1',
  );
}

export function pauseStream({
  streamId,
  transactionMediator,
}: {
  streamId: string;
  transactionMediator: TransactionMediator;
}) {
  return createChangeFunctionCall(
    transactionMediator,
    'pause_stream',
    {stream_id: streamId},
    GAS_SIZE,
    '1',
  );
}

export function stopStream({
  streamId,
  transactionMediator,
}: {
  streamId: string;
  transactionMediator: TransactionMediator;
}) {
  return createChangeFunctionCall(
    transactionMediator,
    'stop_stream',
    {stream_id: streamId},
    GAS_SIZE,
    '1',
  );
}

export function withdrawStreams({
  streamIds,
  transactionMediator,
}: {
  streamIds: string[];
  transactionMediator: TransactionMediator;
}) {
  return createChangeFunctionCall(
    transactionMediator,
    'withdraw',
    {stream_ids: streamIds},
    GAS_SIZE,
    '1',
  );
}

export function createStream({
  comment,
  deposit,
  receiverId,
  tokenAccountId,
  commissionOnCreate,
  tokensPerSec,
  cliffPeriodSec,
  delayed = false,
  isExpirable,
  isLocked,
  callbackUrl,
  color,
  accountId,
  tokenContract,
  transactionMediator,
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
  callbackUrl?: string;
  color: string | null;
  accountId: string;
  tokenContract: FTContract;
  transactionMediator: TransactionMediator;
}) {
  const totalAmount = new BigNumber(deposit).plus(commissionOnCreate).toFixed();
  const transferPayload = {
    balance: deposit,
    owner_id: accountId,
    receiver_id: receiverId,
    token_name: tokenAccountId,
    tokens_per_sec: tokensPerSec,
    cliff_period_sec: cliffPeriodSec,
    is_locked: isLocked,
    is_auto_start_enabled: !delayed,
    is_expirable: isExpirable,
  };
  if (color || comment.length > 0) {
    const description: {c?: string; col?: string} = {};
    if (color) description.col = color;
    if (comment.length > 0) description.c = comment;
    // @ts-expect-error
    transferPayload.description = JSON.stringify(description);
  }

  return transfer({
    payload: transferPayload,
    amount: totalAmount,
    callbackUrl,
    tokenContract,
    tokenAccountId,
    transactionMediator,
  });
}

export function getIncomingStreams({
  from,
  limit,
  contract,
  accountId,
}: {
  from: number;
  limit: number;
  contract: RoketoContract;
  accountId: string;
}): Promise<RoketoStream[]> {
  return contract
    .get_account_incoming_streams({account_id: accountId, from, limit})
    .catch(() => []);
}

export function getOutgoingStreams({
  from,
  limit,
  contract,
  accountId,
}: {
  from: number;
  limit: number;
  contract: RoketoContract;
  accountId: string;
}): Promise<RoketoStream[]> {
  return contract
    .get_account_outgoing_streams({account_id: accountId, from, limit})
    .catch(() => []);
}
