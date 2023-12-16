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
    const summary = []
    const emotion = {
      '신이 난' : 0,
      '외로운' : 0,
      '편안한' : 0,
      '기쁨' : 0,
      '부끄러운' : 0,
      '우울한' : 0,
      '짜증내는' : 0,
      '슬픔' : 0,
      '걱정스러운' : 0,
      '억울한' : 0,
      '불안' : 0,
      '후회되는' : 0,
      '당황' : 0,
      '분노' : 0,
      '스트레스 받은' : 0
    }

    for(let i =0; i<result.length; i++) {
      for(let a=0; a<result[i]['emotion'].length; a++) {
        emotion[result[i]['emotion'][a]] = emotion[result[i]['emotion'][a]] + 1
      }
    }

    let max = result.length - 1
    let min = 0
    let first;
    let second;
    min = Math.ceil(min);
    max = Math.floor(max);
    console.log(result)
    for(let i=0; i<3; i++) {
      let random = Math.floor(Math.random()*(max-min +1)) + min
      if(!(random==first) && !(random==second)) {
        console.log(random)
        summary.push(result[random].summary)
        i==0 ? first=random :second=random
      } else {
        i-- 
      }
    }
    return {
      summary : summary,
      emotion : emotion,
      result : result
    }
  }

  @Get('/analytics')
  @UseGuards(AccessAuthenticationGuard)
  async getClovaData(@Body() text : string) {

    const writing = await this.diaryService.summaryWrting(text)
    const emotion = await this.diaryService.analyzeEmotion(text)
    return {
      emotion : emotion,
      writing : writing
    }
  }
}