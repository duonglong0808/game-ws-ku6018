import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { DataJoinRoom, DataToken } from './dto/interface.dto';
import { RedisService } from 'src/cache/redis.service';
import { TypeEmitMessage } from 'src/constants';

@Injectable()
export class EventService {
  constructor(
    private jwtService: JwtService,
    //
    private readonly cacheService: RedisService,
  ) {}

  // computeServerId = () => {
  //   return `${hostname}:${randomId}#${process.pid}`;
  // };

  bufferObject(data: object) {
    const myString = JSON.stringify(data);
    const myBuffer = Buffer.from(myString, 'utf-8');
    return myBuffer;
  }

  getClientInfo(client: Socket) {
    const headers = client.handshake.headers;
    // console.log('🚀 ~ file: event.service.ts:6 ~ EventService ~ getClientInfo ~ client.handshake:', client.handshake);
    const auth = client.handshake.auth;
    const authorization = headers.authorization;

    return {
      sessionId: client.data.sessionId,
      socketId: client.id,
      clientIp: client.request.headers['x-forwarded-for'],
      time: new Date().toISOString(),
      token: authorization || auth['token'],
      origin: headers['origin'],
      userAgent: headers['user-agent'],
    };
  }

  async checkTokenClient(token: string): Promise<DataToken> {
    let dataUser: DataToken = null;
    await this.jwtService
      .verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      })
      .then((data: DataToken) => {
        dataUser = data;
      })
      .catch((error) => {
        dataUser = null;
      });
    return dataUser;
  }

  parseJwt(token: string): DataToken {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }

  getUserIdByTokenJwt(client: Socket) {
    const clineInfo = this.getClientInfo(client);
    const access_token = clineInfo.token;
    const dataUser = this.parseJwt(access_token);
    const userId = dataUser.id;
    if (!userId) {
      // Ping data user
      client.emit(
        'data',
        this.bufferObject({
          error: 'Token expired',
        }),
      );
      return false;
    }
    return userId;
  }

  async handleJoinRoom(@MessageBody() dataJoin: DataJoinRoom, @ConnectedSocket() client: Socket) {
    const userId = await this.getUserIdByTokenJwt(client);
    if (!userId) {
      // Ping data user
      client.emit(
        'data',
        this.bufferObject({
          error: 'Token expired',
        }),
      );
      return;
    }
    // Kiểm tra dạng tin nhắn , kiểm tra room đã được lập chưa và join room
    const roomName = `room_game-${userId}`;

    const keyPrefix = `${process.env.APP_NAME}:dice-detail:`;
    const keyRedis = await this.cacheService.scanKey(keyPrefix);
    const dataRedis = await Promise.all(keyRedis.map((key) => this.cacheService.get(key)));
    const dataDiceDetail = dataRedis.map((data, index) => {
      const key = keyRedis[index];
      return {
        gameDiceId: key?.split(':')[1],
        diceDetailId: key?.split(':')[2],
        transaction: key?.split(':')[3],
        status: data,
      };
    });

    const dataRes = this.bufferObject({
      typeEmit: TypeEmitMessage.join,
      roomName: roomName,
      userId,
      dataDiceDetail,
    });

    // Ping data user
    client.join(roomName);
    return client.emit('data', dataRes);
  }
}
