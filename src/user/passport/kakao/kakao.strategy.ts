import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { UserService } from '../../service/user.service';
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.KAKAO_ID,
      //callbackURL: 'https://maeum-reader.store/api/user/login/kakao',
      callbackURL: 'http://localhost:3000/api/user/login/kakao'
      //callbackURL: 'http://testbeggars.ap-northeast-2.elasticbeanstalk.com/api/user/login/kakao'
    });  
  } 
  async validate(
    accessToken: string,
    refreshToken: string,
    id_token: any,
    profile: any,
    done: Function,
  ): Promise<any> {
    console.log(id_token.id);
    // const user = await this.userService.userByName(id_token.id);
    // let tokenDto: TokenDto;
    // if (user) {
    //   tokenDto = {
    //     userId: user.userId,
    //     userName: user.userName,
    //     userNickname: user.userNickname,
    //   }; 
      //return tokenDto; 
    //} else {
      //return id_token.id;
    //}
  }
}