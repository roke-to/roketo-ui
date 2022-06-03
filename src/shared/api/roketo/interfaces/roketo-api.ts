import {FTApi} from '~/shared/api/ft/ft-api';

import {RoketoAccount, RoketoStream, RoketoDao} from './entities';

export type CreateStreamApiProps = {
  comment: string;
  deposit: string;
  commissionOnCreate: string;
  receiverId: string;
  tokenAccountId: string;
  tokensPerSec: number;
  name?: string;
  cliffPeriodSec?: number;
  delayed?: boolean;
  isExpirable?: boolean;
  isLocked?: boolean;
  callbackUrl?: string;
  handleTransferStream: FTApi['transfer'];
};

export type StreamsProps = {from: number; limit: number};

export interface RoketoApi {
  // Get account overview info
  getAccount(): Promise<RoketoAccount>;

  // Get detailed stream data
  getStream({streamId}: {streamId: string}): Promise<RoketoStream>;

  // Get roketo dao status
  getDao(): Promise<RoketoDao>;

  // Account incoming streams
  getAccountIncomingStreams(params: StreamsProps): Promise<RoketoStream[]>;

  // Account outgoing streams
  getAccountOutgoingStreams(params: StreamsProps): Promise<RoketoStream[]>;

  // Withdraws funds to user's account
  withdraw({streamIds}: {streamIds: string[]}): Promise<void>;

  // stream actions
  stopStream(params: {streamId: string}): Promise<void>;
  startStream(params: {streamId: string}): Promise<void>;
  pauseStream(params: {streamId: string}): Promise<void>;
}
