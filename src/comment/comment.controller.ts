import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';
import { ApiResponse } from 'src/utility/api-response';
import {
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';
import { request } from 'http';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentDto: CommentDto,
    @Req() request: Request,
  ): Promise<ApiResponse<CommentDto>> {
    const userId: string = request.user?.id!;
    const response: CommentDto = await this.commentService.create(
      createCommentDto,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.CREATED);
  }

  @Get('/getUser')
  @HttpCode(HttpStatus.OK)
  async findAllByUser(
    @Req() request: Request,
    @Query() findCommentQuery: PaginationQueryDto,
  ): Promise<ApiResponse<PaginationAndSortingResult<CommentDto>>> {
    const userId: string = request.user?.id!;
    const response: PaginationAndSortingResult<CommentDto> =
      await this.commentService.findAllByUser(findCommentQuery, userId);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get(':articleId/getArticle')
  @HttpCode(HttpStatus.OK)
  async findAllByArticle(
    @Param('articleId') articleId: string,
    @Query() findCommentQuery: PaginationQueryDto,
  ): Promise<ApiResponse<PaginationAndSortingResult<CommentDto>>> {
    const response: PaginationAndSortingResult<CommentDto> =
      await this.commentService.findAllByArticle(findCommentQuery, articleId);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') commentId: string,
  ): Promise<ApiResponse<CommentDto>> {
    const response: CommentDto = await this.commentService.findOne(commentId);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: Request,
  ): Promise<ApiResponse<CommentDto>> {
    const userId: string = request.user?.id!;
    const response: CommentDto = await this.commentService.update(
      updateCommentDto,
      commentId,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') commentId: string,
    @Req() request: Request,
  ): Promise<ApiResponse<string>> {
    const userId: string = request.user?.id!;
    const response: string = await this.commentService.remove(
      commentId,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }
}
