import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Query,
  Res,
  Redirect,
  Req,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('')
  @Render('client/home')
  getHomee(@Query() query: any) {
    return this.clientService.getHome(query);
  }

  @Get('home')
  @Render('client/home')
  getHome(@Query() query: any) {
    return this.clientService.getHome(query);
  }

  @Get('login')
  @Render('client/login')
  getLogin(@Query() query: any) {
    return this.clientService.getHome(query);
  }

  @Post('login')
  @Redirect()
  postLogin(@Body() body: any, @Res({ passthrough: true }) res: FastifyReply) {
    return this.clientService.postLogin(body, res);
  }

  @Get('register')
  @Render('client/register')
  getRegister(@Query() query: any) {
    return this.clientService.getHome(query);
  }

  @Post('register')
  @Redirect()
  postRegister(
    @Body() body: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.clientService.postRegister(body, res);
  }

  @Get('logout')
  @Redirect()
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    return this.clientService.logout(res);
  }

  @Get('/cat_id/:catId')
  @Render('client/home')
  getProductsByCategoryId(@Param('catId') catId: string, @Query() query: any) {
    return this.clientService.getProductsByCategoryId(catId, query);
  }

  @Get('/prd_id/:prdId')
  @Render('client/product-detail')
  getProductDetailById(@Param('prdId') prdId: string, @Query() query: any) {
    return this.clientService.getProductDetailById(prdId, query);
  }

  @Get('/search')
  @Render('client/search')
  getProductsBySearch(@Query() query: any) {
    return this.clientService.getProductsBySearch(query);
  }

  @Post('/prd_id/:prdId/comment')
  @Redirect()
  postCommentByProductId(
    @Param('prdId') prdId: string,
    @Req() req: FastifyRequest,
    @Body() body: any,
  ) {
    return this.clientService.postCommentByProductId(prdId, body, req);
  }
}
