import { Controller, Get, Post } from "@nestjs/common";

@Controller('/bookmark')
export class BookmarkController {

  @Post('/')
  async addBookmark() {

  }

  @Get('/')
  async getBookmarkList() {
    
  }

}