import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccessStrategy } from './passport/jwt/jwt.strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserService,
    JwtService,
    AccessStrategy
  ]
})
export class UserModule {}
 