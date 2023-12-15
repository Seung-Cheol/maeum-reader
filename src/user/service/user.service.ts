import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { TokenRequest } from '../dto/tokenRequest.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    private readonly jwtService : JwtService
  ){}

  async getKakaotoken(code : String) {
    const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_ID,
        redirect_uri: 'http://localhost:3000/oauth/kakao',
        code : code,
      },
    });
    return response.data.access_token  
  }

  async getKakaoInfo(kakaotoken : String) {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${kakaotoken}`,
      }
    }) 
    console.log(response)
    const tokenRequest = new TokenRequest()
    tokenRequest.mediaId = response.data.id
    tokenRequest.mediaType = 'kakao'
    tokenRequest.nickname = response.data.properties.nickname
    return tokenRequest
  }

  async setToken(tokenRequest : TokenRequest) {
    
    let userInfo = await this.findbyMediaId(tokenRequest.mediaId);
    if(!userInfo) {
      userInfo = await this.createUser(tokenRequest)
    }
    const Authorization = this.jwtService.sign(
      JSON.parse(JSON.stringify(userInfo)),
      {
        secret: process.env.SECRET_KEY,
        expiresIn: process.env.AUTHORIZATION_TIME,
      },
    );
    return `{ Authorization : Bearer ${Authorization},
              id : ${userInfo.id}
              nickname : ${userInfo.nickname}
    }`
  }

  async findbyMediaId(mediaId : string) {
    return await this.userRepository.findOne({
      where : { mediaId }
    }) 
  }

  async createUser(tokenRequest : TokenRequest) {
    const result = this.userRepository.create({
      mediaId : tokenRequest.mediaId,
      nickname : tokenRequest.nickname,
      mediaType : tokenRequest.mediaType
    })
    return await this.userRepository.save(result);
  }
}
