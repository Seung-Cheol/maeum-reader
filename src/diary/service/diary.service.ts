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

    async getListByMonth(month : any) {
      const monthData : any = await this.diaryRepository.createQueryBuilder('diary')
      .where('DATE_FORMAT(diary.writingDay, "%Y-%m")= :month', {month})
      .getMany()
      for(let i=0; i<monthData.length; i++) {
        const emotion = await this.emotionRepository.find({
          where : {
            diaryId : monthData[i].id
          }
        })
        monthData[i]['emotion'] = emotion
      }
      return monthData
    }

    async postDiary(id: number, diaryRequest : DiaryRequest) {
      const userInfo = this.diaryRepository.create({
        userId : id,
        content : diaryRequest.content,
        summary : diaryRequest.summary
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

    }
}
