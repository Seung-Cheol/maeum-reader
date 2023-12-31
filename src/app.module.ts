import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DiaryModule } from './diary/diary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { Diary } from './diary/entity/diary.entity';
import { ConfigModule } from '@nestjs/config';
import { Emotion } from './diary/entity/emotion.entity';
import { Bookmark } from './diary/entity/bookmark.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST, 
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      entities: [
        User,
        Diary,
        Emotion,
        Bookmark
      ],
      extra: {
        timezone: 'Asia/Seoul',
      },
      logging: true,
    }),
    UserModule, 
    DiaryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
