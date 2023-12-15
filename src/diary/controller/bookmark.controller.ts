import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { BookmarkRequest } from "../dto/bookmarkRequest.dto";
import { DiaryService } from "../service/diary.service";
import { DiaryResponse } from "../dto/diaryResponse.dto";
import { AccessAuthenticationGuard } from "src/user/passport/jwt/jwt.guard";

@Controller('api/bookmark')
export class BookmarkController {
  constructor(
    private readonly diaryService : DiaryService
  ){}

  @Post('/:id')
  @UseGuards(AccessAuthenticationGuard)
  async addBookmark(@Param() id : number , @Req() req : any) {
    const { user } = req
    const bookmarkRequest = new BookmarkRequest()
    bookmarkRequest.diaryId = id
    bookmarkRequest.userId = user.id
    await this.diaryService.postBookmark(bookmarkRequest)
    return {
      message : '북마크 등록이 완료됐습니다'
    }
  }

  @Get('/')
  @UseGuards(AccessAuthenticationGuard)
  async getBookmarkList(@Req() req : any) {
    const { user } = req
    const bookmarkList = await this.diaryService.getBookmarkList(user.id);
    const response = []
    const diaryResponse = new DiaryResponse();
    for (const diary of bookmarkList) {
      const res = await this.diaryService.getById(diary.diaryId)
      response.push(res);
    }
    return response

  }

}