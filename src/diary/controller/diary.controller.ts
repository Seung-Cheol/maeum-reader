import { Controller, Post, Get, Delete, Put, Param } from '@nestjs/common';

@Controller('diary')
export class DiaryController {
  constructor(){}

  @Get('/:id')
  async getDiaryById(@Param('id') id : number) {

  }

  @Get('/list')
  async getDiaryListByMonth() {

  }

  @Post('/')
  async postDiary() {
    return 'x';
  }

  @Put('/:id')
  async updateDiary() {

  }

  @Delete('/:id')
  async deleteDiary() {

  }


}