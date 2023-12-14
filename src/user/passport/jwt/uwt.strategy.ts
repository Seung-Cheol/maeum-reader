import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/service/user.service';
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
              let Authorization = request.headers.authorization
              if(!Authorization || Authorization.length < 10) { 
                throw new HttpException('액세스 토큰이 없습니다',HttpStatus.BAD_REQUEST)
              }
              try {
                Authorization = Authorization.split(' ')[1]
                const test = jwtService.verify(Authorization, {
                  secret: process.env.SECRET_KEY,
                }); 
                return Authorization;
              } catch(e) {
                throw new HttpException('액세스 토큰이 유효하지 않습니다',HttpStatus.UNAUTHORIZED)
              }
                
            
        },
      ]),
      secretOrKey: process.env.SECRET_KEY,
    });
  }
  async validate(payload: any) { 
    const user = this.userService.findbyMediaId(payload.mediaId);
    if(!user) {
      throw new HttpException('액세스 토큰 검증 실패',HttpStatus.BAD_REQUEST)
    }
    return user;
  }
}