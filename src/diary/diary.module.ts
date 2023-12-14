import { Module } from '@nestjs/common';
import { DiaryController } from './controller/diary.controller';
import { DiaryService } from './service/diary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './entity/diary.entity';
import { BookmarkController } from './controller/bookmark.controller';
import { Emotion } from './entity/emotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diary,Emotion,Diary])
  ],
  controllers: [DiaryController, BookmarkController],
  providers: [DiaryService]
})
export class DiaryModule {}
