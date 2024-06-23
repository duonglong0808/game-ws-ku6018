import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events/events.gateway';
import { DataSendUpdatePointDto, UpdateStatusGameDto } from './events/dto/interface.dto';
import { RedisService } from './cache/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly eventsGateway: EventsGateway, private readonly cacheService: RedisService) {}

  async updateStatusGameDice(dto: UpdateStatusGameDto) {
    return this.eventsGateway.updateStatusGameDice(dto);
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
