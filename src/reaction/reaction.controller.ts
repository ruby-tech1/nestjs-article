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
import { ReactionService } from './reaction.service';
import { ReactionDto } from './dto/reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { Request } from 'express';
import { ApiResponse } from 'src/utility/api-response';
import { PaginationAndSortingResult } from 'src/utility/pagination-and-sorting';
import {
  EntityReactionQueryDto,
  UserReactionQueryDto,
} from './dto/reaction-query.dto';
import { ReactionNumberDto } from './dto/reaction-number.dto';
import { ReactionNumberRequest } from './dto/reaction-number-request.dto';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createReactionDto: ReactionDto,
    @Req() request: Request,
  ): Promise<ApiResponse<boolean>> {
    const userId: string = request.user?.id!;
    const response: boolean = await this.reactionService.create(
      createReactionDto,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get('entity')
  @HttpCode(HttpStatus.OK)
  async findAllByEntity(
    @Query() findReactionQuery: EntityReactionQueryDto,
  ): Promise<ApiResponse<PaginationAndSortingResult<ReactionDto>>> {
    const response: PaginationAndSortingResult<ReactionDto> =
      await this.reactionService.findAllByEntity(findReactionQuery);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  async findAllByUser(
    @Query() findReactionQuery: UserReactionQueryDto,
    @Req() request: Request,
  ): Promise<ApiResponse<PaginationAndSortingResult<ReactionDto>>> {
    const userId: string = request.user?.id!;
    const response: PaginationAndSortingResult<ReactionDto> =
      await this.reactionService.findAllByUser(findReactionQuery, userId);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Get('number')
  @HttpCode(HttpStatus.OK)
  async findReactionNumber(
    @Query() reactionNumberRequest: ReactionNumberRequest,
  ): Promise<ApiResponse<ReactionNumberDto>> {
    const response: ReactionNumberDto =
      await this.reactionService.findReactionNumber(reactionNumberRequest);
    return ApiResponse.success(response, HttpStatus.OK);
  }
}
