import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from 'src/cache/redis.service';
import { EventService } from './event.service';
import { EventsGateway } from './events.gateway';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EventsGateway, EventService, RedisService],
  exports: [EventsGateway],
})
export class EventsModule {}
