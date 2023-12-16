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
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import axiosRetry from 'axios-retry';
import { HttpService,HttpModule } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DiaryService {
  private cancelTokenSource: CancelTokenSource;
  constructor(
    @InjectRepository(Diary)
    private readonly diaryRepository : Repository<Diary>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository : Repository<Bookmark>,
    @InjectRepository(Emotion)
    private readonly emotionRepository : Repository<Emotion>,
    private readonly httpService : HttpService
  ) {
    // axiosRetry(this.httpService.axiosRef, {
    //   retries: 10,
    //   retryDelay: axiosRetry.exponentialDelay,
    //   shouldResetTimeout: true,
    //   retryCondition(error) {
    //     switch (error.response?.status) {
    //       case 400:
    //       case 404:
    //       case 429:
    //         return true;
    //       default:
    //         return false;
    //     }
    //   },
    // });

  }

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

    async summaryWrting(content : string) {
      console.log("asdasd")
      let text = content['content']
      
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.post('https://clovastudio.apigw.ntruss.com/testapp/v1/api-tools/summarization/v2/d32c67a03d414ac2baa7db4b11615152',
          {
            texts:[text],
            segMaxSize : 3000,
            segMinSize : 1000,
            segCount : 1,
            autoSentenceSplitter : true
          }, 
          {
            headers: {
              'X-NCP-CLOVASTUDIO-API-KEY': process.env.X_NCP_CLOVASTUDIO_API_KEY_2,
              'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
              'X-NCP-CLOVASTUDIO-REQUEST-ID': process.env.X_NCP_CLOVASTUDIO_REQUEST_ID_2,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data.result.text
    }

    async analyzeEmotion(content : string) {
      let emotion = []
      let text = content['content']
      console.log(typeof text)
      const maxlength = 50
      const parts = [];
      if (text.length >= maxlength) {
        const chunkSize = Math.ceil(text.length / 5);
    
        for (let i = 0; i < 5; i++) {
          const start = i * chunkSize;
          const realstart = 0
          const end = start + chunkSize;
          parts.push(text.substring(realstart, end));
        }
    
      } else {
        const chunkSize = Math.ceil(text.length / 3);
    
        for (let i = 0; i < 3; i++) {
          const start = i * chunkSize;
          const realstart = 0
          const end = start + chunkSize;
          parts.push(text.substring(start, end));
        }
    
      }
      console.log(parts);
      
      for (let i = 0; i < parts.length; i++) {
        console.log(parts);
  
        this.cancelTokenSource = axios.CancelToken.source();
  
        try {
          const response: AxiosResponse = await lastValueFrom(
            this.httpService.post(
              'https://clovastudio.apigw.ntruss.com/serviceapp/v1/tasks/8nwqliza/search',
              {
                text: parts[i],
              },
              {
                headers: {
                  'X-NCP-CLOVASTUDIO-API-KEY': process.env.X_NCP_CLOVASTUDIO_API_KEY,
                  'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
                  'X-NCP-CLOVASTUDIO-REQUEST-ID': process.env.X_NCP_CLOVASTUDIO_REQUEST_ID,
                  'Content-Type': 'application/json',
                },
                cancelToken: this.cancelTokenSource.token,
              },
            ),
          );
  
          console.log(response);
          emotion.push(response.data.result.outputText);
          if(response.data.result==null) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const response: AxiosResponse = await lastValueFrom(
            this.httpService.post(
              'https://clovastudio.apigw.ntruss.com/serviceapp/v1/tasks/8nwqliza/search',
              {
                text: parts[i],
              },
              {
                headers: {
                  'X-NCP-CLOVASTUDIO-API-KEY': process.env.X_NCP_CLOVASTUDIO_API_KEY,
                  'X-NCP-APIGW-API-KEY': process.env.X_NCP_APIGW_API_KEY,
                  'X-NCP-CLOVASTUDIO-REQUEST-ID': process.env.X_NCP_CLOVASTUDIO_REQUEST_ID,
                  'Content-Type': 'application/json',
                },
                cancelToken: this.cancelTokenSource.token,
              },
            ),
          );

          console.log(response);
          emotion.push(response.data.result.outputText);

          }

          if(i+1!=parts.length)
            await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
          console.error(error);
  
          if (axios.isCancel(error)) {
            console.log('Request canceled.');
          } else {
            console.error(`Failed to fetch data: ${error.message}`);
          }
        }
      }
      if(emotion.length==2) {
        emotion.push('억울한')
      }
      return emotion;
    }
  
    // 요청을 취소하고 연결을 끊습니다.
    public cancelRequest(): void {
      if (this.cancelTokenSource) {
        this.cancelTokenSource.cancel('Request canceled by the user.');
      }
    }
}
