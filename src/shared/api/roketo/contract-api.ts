import { Account, Contract, WalletConnection } from 'near-api-js';
import BigNumber from 'bignumber.js';

import { GAS_SIZE } from './config';
import { RoketoContract } from './interfaces/contracts';
// import { RoketoApi } from './interfaces/roketo-api';
import { RoketoTokenStatus, RoketoAccount, RoketoStream } from './interfaces/entities';
import { CreateStreamApiProps, StreamsProps } from './interfaces/roketo-api'
import { getEmptyAccount } from './helpers';

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
    description,
    deposit,
    receiverId,
    tokenAccountId,
    commissionOnCreate,
    tokensPerSec,
    cliffPeriodSec,
    isAutoStart = true,
    isExpirable,
    isLocked,
    callbackUrl,
    handleTransferStream,
  }: CreateStreamApiProps) {
    const totalCost = new BigNumber(deposit).plus(commissionOnCreate).toFixed();
    const transferPayload = {
      Create: {
        request: {
          description,
          balance: deposit,
          owner_id: this.accountId,
          receiver_id: receiverId,
          token_name: tokenAccountId,
          tokens_per_sec: tokensPerSec,
          cliff_period_sec: cliffPeriodSec,
          is_locked: isLocked,
          is_auto_start_enabled: isAutoStart,
          is_expirable: isExpirable,
        }
      },
    };

    try {
      return handleTransferStream(
        transferPayload,
        totalCost,
        GAS_SIZE,
        callbackUrl
      );
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
