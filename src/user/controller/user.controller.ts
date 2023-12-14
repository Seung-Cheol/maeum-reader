import { Controller, Post, Get, Res, UseGuards, Query } from '@nestjs/common';
import { KakaoAuthenticationGuard } from '../passport/kakao/kakao.guard';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService : UserService
  ) {}

  @Post('/kakao')
  async kakaoLogin(@Query('code') code : String) {
    const kakaotoken = await this.userService.getKakaotoken(code);
    const tokenRequest = await this.userService.getKakaoInfo(kakaotoken);
    return await this.userService.setToken(tokenRequest)
  }

}