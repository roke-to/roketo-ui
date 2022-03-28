import BigNumber from 'bignumber.js';
import { Account, Contract, WalletConnection } from 'near-api-js';

import { TokenMetadata } from 'shared/api/ft/types';

import { GAS_SIZE } from './config';
import { RoketoContract } from './interfaces/contracts';
// import { RoketoApi } from './interfaces/roketo-api';
import { RoketoTokenStatus, RoketoAccount, RoketoStream } from './interfaces/entities';
import { CreateStreamApiProps, StreamsProps } from './interfaces/roketo-api'
import { getEmptyAccount } from './helpers';

type FTContract = Contract & {
  ft_balance_of: (options: { account_id: string }) => Promise<never>;
  ft_metadata: () => Promise<TokenMetadata>;
  storage_balance_of: (options: { account_id: string }) => Promise<never>;
};

function createFTContract(account: Account, address: string) {
  return new Contract(account, address, {
    viewMethods: ['ft_balance_of', 'ft_metadata', 'storage_balance_of'],
    changeMethods: ['ft_transfer', 'ft_transfer_call', 'storage_deposit', 'near_deposit'],
  }) as FTContract; // TODO: type without type assertion
}

type NewRoketoApiProps = {
  accountId: string;
  account: Account;
  contract: RoketoContract;
  walletConnection: WalletConnection;
  ft?: Record<
    string,
    {
      name: string;
      address: string;
      contract: Contract;
    }
  >;
  operationalCommission?: string;
  tokens?: Record<string, RoketoTokenStatus>;
}

export class RoketoContractApi {
  contract: RoketoContract;

  // walletConnection: WalletConnection;

  account: Account;

  accountId: string;

  constructor({
    contract,
    // walletConnection,
    account,
    accountId,
  }: NewRoketoApiProps) {
    this.contract = contract;

    // this.walletConnection = walletConnection;
    this.account = account;
    this.accountId = accountId;
  }

  async getAccount(): Promise<RoketoAccount> {
    const newAccount = await this.contract.get_account({ account_id: this.accountId });
    console.log('newAccount', newAccount)

    if (newAccount.Err) {
      return getEmptyAccount();
    }

    return newAccount.Ok;
  }

  async getAccountIncomingStreams({ from, limit }: StreamsProps): Promise<RoketoStream[]> {
    const res = await this.contract.get_account_incoming_streams({ account_id: this.accountId, from, limit });
    
    return res.Ok;
  }

  async getAccountOutgoingtreams({ from, limit }: StreamsProps): Promise<RoketoStream[]> {
    const res = await this.contract.get_account_outgoing_streams({ account_id: this.accountId, from, limit });

    return res.Ok;
  }

  async getStream({ streamId }: { streamId: string }) {
    const res = await this.contract.get_stream({
      stream_id: streamId,
    });

    return res.Ok;
  }

  async getDao() {
    const res = await this.contract.get_dao();

    return res;
  }

  async createStream({
    name,
    description,
    deposit,
    receiverId,
    token,
    tokensPerSec,
    cliffPeriodSec,
    isAutoStart = true,
    isExpirable,
    isLocked,
    callbackUrl
  }: CreateStreamApiProps) {
    let res;
    console.log('name', name)
    // const createCommission = tokens[token].commission_on_create;
    const tokenContract = createFTContract(this.account, 'wrap.testnet');

    // const accountId = this.walletConnection.getAccountId();

    // @ts-ignore
    // await tokenContract.storage_deposit({ account_id: this.contract.contractId }, GAS_SIZE, '1250000000000000000000' )
    // await tokenContract.near_deposit({}, GAS_SIZE, '12500000000000000000000' )
    const r = await tokenContract.ft_balance_of({ account_id: this.accountId })
    console.log('r', r, isAutoStart)

    try {
        // const tokenContract = ft[token].contract;
        // @ts-ignore
        res = await tokenContract.ft_transfer_call({
          args: {
            receiver_id: this.contract.contractId,
            amount: new BigNumber(deposit).toFixed(),
            memo: 'Roketo transfer',
            msg: JSON.stringify({
              Create: { request: {
                description,
                balance: deposit,
                owner_id: this.accountId,
                receiver_id: receiverId,
                token_name: token,
                tokens_per_sec: tokensPerSec,
                cliff_period_sec: cliffPeriodSec,
                is_locked: isLocked,
                // is_auto_start_enabled: isAutoStart,
                is_expirable: isExpirable,
              }},
            }),
          },
          gas: GAS_SIZE,
          amount: 1,
          callbackUrl,
      });
      return res;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }

  async startStream({ streamId }: { streamId: string }) {
    const res = await this.contract.start_stream(
      { stream_id: streamId },
      GAS_SIZE
    );

    return res;
  }

  async pauseStream({ streamId }: { streamId: string }) {
    const res = await this.contract.pause_stream(
      { stream_id: streamId },
      GAS_SIZE
    );

    return res;
  }

  async stopStream({ streamId }: { streamId: string }) {
    const res = await this.contract.stop_stream(
      { stream_id: streamId },
      GAS_SIZE
    );
    return res;
  }

  async withdraw({ streamIds }: { streamIds: string[] }) {
    const res = await this.contract.withdraw(
      { stream_ids: streamIds },
      GAS_SIZE
    );
    return res;
  }
}

// export function oldRoketoContractApi({
//   contract,
//   ft,
//   walletConnection,
//   account,
//   operationalCommission,
//   tokens,
// }: NewRoketoApiProps): RoketoApi {
//   const getAccount = async (accountId: string): Promise<RoketoAccount> => {
//     const fallback = getEmptyAccount(accountId);
//     try {
//       const newAccount = await contract.get_account({ account_id: accountId });
//       return newAccount || fallback;
//     } catch (e) {
//       console.debug('[RoketoContractApi]: nearerror', e);
//     }
//     return fallback;
//   };

//   return {
//     // account methods
//     getCurrentAccount: () => getAccount(walletConnection.getAccountId()),
//     updateAccount: async function updateAccount({
//       tokensWithoutStorage = 0,
//     }): Promise<void> {
//       const res = await contract.update_account(
//         {
//           account_id: account.accountId,
//         },
//         GAS_SIZE,
//         new BigNumber(STORAGE_DEPOSIT)
//           .multipliedBy(tokensWithoutStorage)
//           .plus(operationalCommission)
//           .toFixed()
//       );
//       return res;
//     },
//     // stream methods
//     getAccount,
//     createStream: async function createStream(
//       {
//         deposit,
//         receiverId,
//         token,
//         speed,
//         description,
//         isAutoStartEnabled = true,
//       },
//       { callbackUrl } = {}
//     ) {
//       let res;
//       const createCommission = tokens[token].commission_on_create;

//       try {
//         if (token === 'NEAR') {
//           // contract.methodName({ args, gas?, amount?, callbackUrl?, meta? })
//           res = await contract.create_stream({
//             args: {
//               owner_id: walletConnection.getAccountId(),
//               receiver_id: receiverId,
//               token_name: token,
//               tokens_per_tick: speed,
//               description,
//               is_auto_deposit_enabled: false, // TODO: Remove after switching to contract v2
//               is_auto_start_enabled: isAutoStartEnabled,
//             },
//             gas: GAS_SIZE,
//             amount: new BigNumber(deposit).plus(createCommission).toFixed(),
//             callbackUrl,
//           });
//         } else {
//           const tokenContract = ft[token].contract;
//           // @ts-ignore
//           res = await tokenContract.ft_transfer_call({
//             args: {
//               receiver_id: contract.contractId,
//               amount: new BigNumber(deposit).plus(createCommission).toFixed(),
//               memo: 'Roketo transfer',
//               msg: JSON.stringify({
//                 Create: {
//                   description,
//                   owner_id: walletConnection.getAccountId(),
//                   receiver_id: receiverId,
//                   token_name: token,
//                   tokens_per_tick: speed,
//                   balance: deposit,
//                   is_auto_deposit_enabled: false, // TODO: Remove after switching to contract v2
//                   is_auto_start_enabled: isAutoStartEnabled,
//                 },
//               }),
//             },
//             gas: GAS_SIZE,
//             amount: 1,
//             callbackUrl,
//           });
//         }
//         return res;
//       } catch (error) {
//         console.debug(error);
//         throw error;
//       }
//     },
//     depositStream: async function depositStream({ streamId, token, deposit }) {
//       if (token === 'NEAR') {
//         await contract.deposit({ stream_id: streamId }, GAS_SIZE, deposit);
//       } else {
//         const tokenContract = ft[token].contract;

//         // @ts-ignore
//         await tokenContract.ft_transfer_call(
//           {
//             receiver_id: contract.contractId,
//             amount: deposit,
//             msg: JSON.stringify({
//               Deposit: streamId,
//             }),
//           },
//           GAS_SIZE,
//           1
//         );
//       }
//     },
//     pauseStream: async function pauseStream({ streamId }) {
//       const res = await contract.pause_stream(
//         { stream_id: streamId },
//         GAS_SIZE,
//         operationalCommission
//       );

//       return res;
//     },
//     startStream: async function startStream({ streamId }) {
//       const res = await contract.start_stream(
//         { stream_id: streamId },
//         GAS_SIZE,
//         operationalCommission
//       );

//       return res;
//     },
//     stopStream: async function stopStream({ streamId }) {
//       const res = await contract.stop_stream(
//         { stream_id: streamId },
//         GAS_SIZE,
//         operationalCommission
//       );
//       return res;
//     },
//     // View methods
//     getStream: async function getStream({ streamId }) {
//       const res = await contract.get_stream({
//         stream_id: streamId,
//       });

//       return res;
//     },
//     getStatus: async function getStatus() {
//       const res = await contract.get_status({});
//       return res;
//     },
//     getStreamHistory: async function getStreamHistory({ streamId, from, to }) {
//       const res = await contract.get_stream_history({
//         stream_id: streamId,
//         from,
//         to,
//       });

//       return res;
//     },
//   };
// }
