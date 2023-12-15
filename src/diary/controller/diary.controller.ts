import { Controller, Post, Get, Delete, Put, Param, UseGuards, Req, Body } from '@nestjs/common';
import { AccessAuthenticationGuard } from 'src/user/passport/jwt/jwt.guard';
import { DiaryService } from '../service/diary.service';
import { DiaryRequest } from '../dto/diaryRequest.dto';
import { DiaryUpdate } from '../dto/diaryUpdate.dto';
@Controller('/api/diary')
export class DiaryController {
  constructor(
    private readonly diaryService : DiaryService
  ){}

  @Get('/:id')
  @UseGuards(AccessAuthenticationGuard)
  async getDiaryById(@Param('id') id : number) {
    return await this.diaryService.getById(id);
  }

  @Get('/list/:month')
  @UseGuards(AccessAuthenticationGuard)
  async getDiaryListByMonth(@Param('month') month : any) {
    return await this.diaryService.getListByMonth(month);
  }

  @Post('/')
  @UseGuards(AccessAuthenticationGuard)
  async postDiary(@Req() req : any, @Body() diayRequest : DiaryRequest) {
    const { user } = req
    await this.diaryService.postDiary(user.id, diayRequest)
    return {
      message : '일기 작성이 완료됐습니다'
    }
  }

  @Put('/')
  @UseGuards(AccessAuthenticationGuard)
  async updateDiary(@Body() diaryUpdate : DiaryUpdate) {
    await this.diaryService.updateDiary(diaryUpdate)
    return {
      message : '일기 수정이 완료됐습니다'
    }
  }

  @Delete('/:id')
  @UseGuards(AccessAuthenticationGuard)
  async deleteDiary(@Param('id')id : number) {
    await this.diaryService.removeDiary(id)
    return {
      message : '일기 삭제 완료했습니다'
    }
  }


}