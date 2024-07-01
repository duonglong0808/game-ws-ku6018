import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { DataSendUpdatePointDto, UpdateStatusGameBaccaratDto, UpdateStatusGameDiceDto } from './events/dto/interface.dto';
import { RedisService } from './cache/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly eventsGateway: EventsGateway, private readonly cacheService: RedisService) {}

  async updateStatusGameDice(dto: UpdateStatusGameDiceDto) {
    return this.eventsGateway.updateStatusGameDice(dto);
  }

  async updateStatusGameBaccarat(dto: UpdateStatusGameBaccaratDto) {
    return this.eventsGateway.updateStatusGameBaccarat(dto);
  }

  async updatePointUser(dto: DataSendUpdatePointDto) {
    return this.eventsGateway.updatePointUser(dto);
  }

  async deleteKeyRedis(key: string, confirm: number) {
    const allKeys = await this.cacheService.scanKey(key);
    if (confirm) {
      await this.cacheService.deleteMany(allKeys);
    }
    return {
      allKeys,
      confirm,
    };
  }
}
