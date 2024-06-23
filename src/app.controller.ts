import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateStatusGameDto, DataSendUpdatePointDto } from './events/dto/interface.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('dice/status')
  updateStatusGame(@Body() dto: UpdateStatusGameDto) {
    return this.appService.updateStatusGameDice(dto);
  }

  @Post('user/point')
  upPointByUser(@Body() dto: DataSendUpdatePointDto) {
    return this.appService.updatePointUser(dto);
  }

  @Get('redis')
  deleteRedis(@Query('key') key: string, @Query('c') c: string) {
    return this.appService.deleteKeyRedis(key, +c);
  }
}
