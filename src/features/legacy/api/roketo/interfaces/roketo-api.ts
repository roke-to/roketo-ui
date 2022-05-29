import {
  RoketoAccount,
  RoketoStatus,
  LegacyRoketoStream,
  StreamAction,
} from './entities';

export interface RoketoApi {
  // View Methods
  // Get account overview info
  getAccount(accountId: string): Promise<RoketoAccount>;
  getCurrentAccount(): Promise<RoketoAccount>;

  // Get detailed stream data
  getStream({ streamId }: { streamId: string }): Promise<LegacyRoketoStream>;

  /**
   * Retrieve stream actions history.
   * It has pagination, 5-10 entries page size should work just fine
   * @param `from` - index of action to start from
   * @param `to` - index of last action
   */
  getStreamHistory(params: {
    streamId: string;
    from: number;
    to: number;
  }): Promise<StreamAction[]>;

  // Get info about supported tokens, commissions
  getStatus(): Promise<RoketoStatus>;

  // Change Methods
  // Withdraws funds to user's account
  updateAccount(params: { tokensWithoutStorage?: number }): Promise<void>;

  createStream(
    params: {
      deposit: string;
      receiverId: string;
      token: string;
      speed: string;
      description: string;
      isAutoStartEnabled: boolean;
    },
    opts: {
      callbackUrl?: string;
    }
  ): Promise<void>;
  stopStream(params: { streamId: string }): Promise<void>;
  startStream(params: { streamId: string }): Promise<void>;
  pauseStream(params: { streamId: string }): Promise<void>;
  depositStream(params: {
    streamId: string;
    token: string;
    deposit: string;
  }): Promise<void>;
}
