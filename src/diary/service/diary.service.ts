import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Diary } from '../entity/diary.entity';
import { Repository } from 'typeorm';
import { Emotion } from '../entity/emotion.entity';
import { DiaryRequest } from '../dto/diaryRequest.dto';
import { DiaryResponse } from '../dto/diaryResponse.dto';
import { BookmarkRequest } from '../dto/bookmarkRequest.dto';
import { DiaryUpdate } from '../dto/diaryUpdate.dto';
import { Bookmark } from '../entity/bookmark.entity';
import { DiaryController } from '../controller/diary.controller';
import axios from 'axios';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepository : Repository<Diary>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository : Repository<Bookmark>,
    @InjectRepository(Emotion)
    private readonly emotionRepository : Repository<Emotion>
  ) {}

    async getById(id : number, month? : any) {
      let diary;
      if(!month) {
        diary = await this.diaryRepository.findOne({where:{id}})
      } else {
        diary = await this.diaryRepository.createQueryBuilder('diary')
        .where('DATE_FORMAT(diary.writingDay, "%Y-%m")= :month', {month})
        .andWhere('diary.id = :id', { id })
        .getOne();
    }

      const emotion : any = await this.emotionRepository.find({
        where : {
          diaryId : id
        }
      })
      const emotions = []
      emotion.forEach((e)=>{
        const { emotion} = e
        emotions.push(emotion)
      })
      console.log(diary)
      if(!diary) {
        return {
          message : "데이터가 없습니다"
        }
      }
      const diaryResponse = new DiaryResponse();
      diaryResponse.content = diary.content;
      diaryResponse.emotion = emotions;
      diaryResponse.id = diary.id
      diaryResponse.summary = diary.summary;
      diaryResponse.createdAt = diary.createdAt
      return {
        diaryResponse
      }
    }

    async getListByMonth(month : any, id : number) {
      const monthData : any = await this.diaryRepository.createQueryBuilder('diary')
      .where('DATE_FORMAT(diary.writingDay, "%Y-%m")= :month', {month})
      .andWhere('diary.userId=:userId',{userId:id})
      .getMany()
      for(let i=0; i<monthData.length; i++) {
        const emotion = await this.emotionRepository.find({
          where : {
            diaryId : monthData[i].id
          }
        })
        monthData[i]['emotion'] = []
        for(let a=0; a<emotion.length; a++) {
          monthData[i]['emotion'].push(emotion[a].emotion)
        }
      }
      return monthData
    }

    async postDiary(id: number, diaryRequest : DiaryRequest) {
      //console.log(diaryRequest)
      //const writingDay = new Date(diaryRequest.wrtingDay).getTime();
      //console.log(writingDay)
      const userInfo = this.diaryRepository.create({
        userId : id,
        content : diaryRequest.content,
        summary : diaryRequest.summary,
        writingDay : diaryRequest.writingDay
      })
      await this.diaryRepository.save(userInfo)

      for (const emotion of diaryRequest.emotion ) {
        const emotionInfo = this.emotionRepository.create({
          diaryId : userInfo.id,
          emotion : emotion
        })
        await this.emotionRepository.save(emotionInfo)
      }
    }

    async updateDiary(diaryUpdate : DiaryUpdate) {
      const result = await this.diaryRepository.findOne({
        where : {
          id : diaryUpdate.id
        }
      })
      if(diaryUpdate.content)
        result.content = diaryUpdate.content

      if(diaryUpdate.summary)
        result.summary = diaryUpdate.summary

      await this.diaryRepository.save(result);

      if(diaryUpdate.emotion) {
      await this.removeEmotion(diaryUpdate.id)
      for (const emotion of diaryUpdate.emotion ) {
        const emotionInfo = this.emotionRepository.create({
          diaryId : diaryUpdate.id,
          emotion : emotion
        })
        await this.emotionRepository.save(emotionInfo)
      }
    }
    }

    async postBookmark(bookmarkRequest : BookmarkRequest) {
      const result = this.bookmarkRepository.create({
        diaryId : bookmarkRequest.diaryId,
        userId : bookmarkRequest.userId
      })
      await this.bookmarkRepository.save(result);
    }

    async removeDiary(id : number) {
      await this.diaryRepository.delete({
        id
      })
    }

    async removeEmotion(diaryId : number) {
      await this.emotionRepository.delete({
        diaryId
      })
    }

    async getBookmarkList(userId : number) {
      return await this.bookmarkRepository.find({
        where : {
          userId
        }
      })
    }

    async summaryWrting() {

    }

    async analyzeEmotion() {
      const response = await axios.post('https://clovastudio.apigw.ntruss.com/testapp/v1/tasks/8nwqliza/search', 
      {
        includeAiFilters : true,
        text : "안녕하세요 반갑습니다 오늘도 행복한 하루 되세요"
      }, {
        headers : {
          'X-NCP-CLOVASTUDIO-API-KEY' : process.env.X_NCP_CLOVASTUDIO_API_KEY,
          'X-NCP-APIGW-API-KEY' : process.env.X_NCP_APIGW_API_KEY,
          'X-NCP-CLOVASTUDIO-REQUEST-ID': process.env.X_NCP_CLOVASTUDIO_REQUEST_ID,
          'Content-Type': 'application/json'
        }
      }); 
      console.log(response)
    }
}
