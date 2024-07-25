import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { BeforeApplicationShutdown } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { EventService } from './event.service';
import { DataJoinRoom, DataSendMessage, DataSendUpdatePointDto, UpdatePointDto, UpdateStatusGameBaccaratDto, UpdateStatusGameDiceDto } from './dto/interface.dto';
import { TypeEmitMessage } from 'src/constants';
import { mockMessages, mockNames } from 'src/mocks';

@WebSocketGateway({
  allowEIO3: true,
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, BeforeApplicationShutdown {
  constructor(private readonly eventService: EventService) {}

  @WebSocketServer()
  server: Server;

  bufferObject(data: object) {
    const myString = JSON.stringify(data);
    const myBuffer = Buffer.from(myString, 'utf-8');
    return myBuffer;
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('🚀 ~ file: events.gateway.ts:18 ~ handleConnection ~ client:');
  }

  handleDisconnect(client: Socket) {
    // return this.eventService.handleClientDisconnect(client);
  }

  beforeApplicationShutdown(signal?: string) {
    console.log('ÔKKK');
    // return this.eventService.handleApplicationShutdown();
  }

  afterInit(server: Server) {
    // Đây là nơi bạn có thể thực hiện các công việc cần thiết sau khi Gateway đã sẵn sàng
    console.log('WebSocket Gateway initialized');
  }

  onModuleInit() {
    setInterval(() => {
      this.sendRandomMessage();
    }, 2000); // Gửi tin nhắn ngẫu nhiên mỗi 2 giây
  }

  sendRandomMessage() {
    if (Math.random() > 0.5) {
      const date = new Date();
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];

      const dataEmit = { sender: randomName, group: 'dice', content: randomMessage, typeEmit: TypeEmitMessage.NewMessage, timeSend: `${date.getHours()}:${date.getMinutes()}` };
      this.server.emit('data', this.bufferObject(dataEmit));
    }
  }

  @SubscribeMessage('join-room')
  joinRoom(@MessageBody() data: DataJoinRoom, @ConnectedSocket() client: Socket) {
    return this.eventService.handleJoinRoom(data, client);
  }

  updateStatusGameDice(dto: UpdateStatusGameDiceDto) {
    const dataRes = this.bufferObject({
      typeEmit: TypeEmitMessage.updateStatusDice,
      ...dto,
    });

    this.server.emit('data', dataRes);
  }

  @SubscribeMessage('send-message')
  sendMessage(@MessageBody() data: DataSendMessage, @ConnectedSocket() client: Socket, server: Server) {
    return this.eventService.handleSendMessage(data, client, this.server);
  }

  updateStatusGameBaccarat(dto: UpdateStatusGameBaccaratDto) {
    const dataRes = this.bufferObject({
      typeEmit: TypeEmitMessage.updateStatusBaccarat,
      ...dto,
      pokerBanker: dto.pokerBanker ? dto.pokerBanker.split(',') : '',
      pokerPlayer: dto.pokerPlayer ? dto.pokerPlayer.split(',') : '',
    });

    this.server.emit('data', dataRes);
  }

  updatePointUser(dto: DataSendUpdatePointDto) {
    dto.data.map((data) => {
      const roomName = `room_game-${data.userId}`;

      const dataSend = this.bufferObject({
        typeEmit: TypeEmitMessage.updatePoint,
        ...data,
      });

      this.server.to(roomName).emit('data', dataSend);
    });
  }

  @SubscribeMessage('leave-room')
  leaveRoom(@MessageBody() data: DataJoinRoom, @ConnectedSocket() client: Socket) {
    // return this.eventService.handleLeaveRoom(data, client);
  }
}
