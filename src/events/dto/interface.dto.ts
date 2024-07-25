export class DataJoinRoom {}

export class DataToken {
  id: string;
  username: string;
  email: string;
  status: string;
}

export class DataSendMessage {
  group: string;
  content: string;
  // typeMessage: string;
  timeSend: Date;
  username: string;
}

export interface UpdateStatusGameDiceDto {
  gameDiceId: number;
  diceDetailId: number;
  transaction: number;
  mainTransaction: number;
  status: number | string;
  totalRed?: number;
}

export interface UpdateStatusGameBaccaratDto {
  gameBaccaratId: number;
  baccaratDetailId: number;
  transaction: number;
  mainTransaction: string;
  status: number | string;
  pokerBanker?: string;
  pokerPlayer?: string;
}

export interface UpdatePointDto {
  userId: number;
  type: number;
  points: number;
  pointBetMain: number;
}

export interface DataSendUpdatePointDto {
  data: UpdatePointDto[];
}
