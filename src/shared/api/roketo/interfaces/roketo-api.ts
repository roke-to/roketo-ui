import {
  RoketoAccount,
  RoketoStatus,
  RoketoStream,
  StreamAction,
  RoketoDao
} from './entities';

export type CreateStreamApiProps = {
  name: string;
  description: string;
  deposit: string;
  receiverId: string;
  token: string;
  tokensPerSec: number;
  cliffPeriodSec?: string;
  isAutoStart?: boolean;
  isExpirable?: boolean,
  isLocked?: boolean,
  callbackUrl?: string;
};

export type StreamsProps = { from: number, limit: number };

export interface RoketoApi {
  // Get account overview info
  getAccount(): Promise<RoketoAccount>;

  // Get detailed stream data
  getStream({ streamId }: { streamId: string }): Promise<RoketoStream>;

  // Get roketo dao status
  getDao(): Promise<RoketoDao>;

  // Account incoming streams
  getAccountIncomingStreams(params: StreamsProps): Promise<RoketoStream[]>;

  // Account outgoing streams
  getAccountOutgoingtreams(params: StreamsProps): Promise<RoketoStream[]>;

  // Withdraws funds to user's account
  withdraw({ streamIds }: { streamIds: string[] }): Promise<void>;

  // stream actions
  stopStream(params: { streamId: string }): Promise<void>;
  startStream(params: { streamId: string }): Promise<void>;
  pauseStream(params: { streamId: string }): Promise<void>;
}