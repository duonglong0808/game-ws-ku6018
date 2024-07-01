import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateStatusGameDiceDto, DataSendUpdatePointDto, UpdateStatusGameBaccaratDto } from './events/dto/interface.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('dice/status')
  updateStatusGame(@Body() dto: UpdateStatusGameDiceDto) {
    return this.appService.updateStatusGameDice(dto);
  }

  @Post('baccarat/status')
  updateStatusGameBaccarat(@Body() dto: UpdateStatusGameBaccaratDto) {
    return this.appService.updateStatusGameBaccarat(dto);
  }

  @Post('user/point')
  upPointByUser(@Body() dto: DataSendUpdatePointDto) {
    return this.appService.updatePointUser(dto);
  }

  @Get('redis')
  deleteRedis(@Query('key') key: string, @Query('c') c: string) {
    console.log('🚀 ~ AppController ~ deleteRedis ~ c:', c);
    return this.appService.deleteKeyRedis(key, +c);
  }
}
