import { Controller, Post, Get, Delete, Put, Param, UseGuards, Req, Body, Query } from '@nestjs/common';
import { AccessAuthenticationGuard } from 'src/user/passport/jwt/jwt.guard';
import { DiaryService } from '../service/diary.service';
import { DiaryRequest } from '../dto/diaryRequest.dto';
import { DiaryUpdate } from '../dto/diaryUpdate.dto';
@Controller('/api/diary')
export class DiaryController {
  constructor(
    private readonly diaryService : DiaryService
  ){}

  @Get('/get/:id')
  @UseGuards(AccessAuthenticationGuard)
  async getDiaryById(@Param('id') id : number) {
    console.log("ASDasdasd")
    return await this.diaryService.getById(id);
  }

  @Get('/list')
  @UseGuards(AccessAuthenticationGuard)
  async getDiaryListByMonth(@Query('month') month : any, @Req() req : any) {
    console.log("Adsasdsa")
    console.log(month+"ㅁㄴㅇㅁㄴㅇ") 
    const {user} = req
    return await this.diaryService.getListByMonth(month, user.id);
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

  @Get('/stat')
  @UseGuards(AccessAuthenticationGuard)
  async getDiaryStat(@Req() req : any, @Query('month') month : String) {
    const { user } = req
    const result = await this.diaryService.getListByMonth(month, user.id)
    console.log(result)
  }

  @Get('/analytics')
  @UseGuards(AccessAuthenticationGuard)
  async getClovaData(@Body() body : DiaryRequest) {
    const emotion = this.diaryService.analyzeEmotion()
    console.log(emotion)
    const writing = this.diaryService.summaryWrting()
    Promise.all([writing,emotion])
    return 'z';
  }
}