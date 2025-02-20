import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { ApiResponse } from 'src/utility/api-response';
import { ArticleDto } from './dto/article.dto';
import { Request } from 'express';
import {
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: Request,
    @Body() articleDto: ArticleDto,
  ): Promise<ApiResponse<ArticleDto>> {
    const userId: string = request.user?.id!;
    const response: ArticleDto = await this.articleService.create(
      articleDto,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() findArticleQuery: PaginationQueryDto,
  ): Promise<ApiResponse<PaginationAndSortingResult<ArticleDto>>> {
    const response: PaginationAndSortingResult<ArticleDto> =
      await this.articleService.findAll(findArticleQuery);
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  async findAllUser(
    @Query() findArticleQuery: PaginationQueryDto,
    @Req() request: Request,
  ): Promise<ApiResponse<PaginationAndSortingResult<ArticleDto>>> {
    const userId: string = request.user?.id!;
    const response: PaginationAndSortingResult<ArticleDto> =
      await this.articleService.findAllUser(findArticleQuery, userId);
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') articleId: string,
    @Req() request: Request,
  ): Promise<ApiResponse<ArticleDto>> {
    const userId: string = request.user?.id!;
    const response: ArticleDto = await this.articleService.findOne(
      articleId,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') articleId: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() request: Request,
  ): Promise<ApiResponse<ArticleDto>> {
    const userId: string = request.user?.id!;
    const response = await this.articleService.update(
      articleId,
      updateArticleDto,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') articleId: string,
    @Req() request: Request,
  ): Promise<ApiResponse<string>> {
    const userId: string = request.user?.id!;
    const response = await this.articleService.delete(articleId, userId);
    return ApiResponse.success(response, HttpStatus.OK);
  }
}
