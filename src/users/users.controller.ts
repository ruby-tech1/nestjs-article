import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';
import { ApiResponse } from 'src/utility/api-response';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResetPasswordRequest } from 'src/auth/dto/reset-password-request.dto';
import { Request } from 'express';
import { ok } from 'assert';
import { UpdatePasswordRequest } from './dto/update-password-request.dto';

@ApiTags('Users-Service')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Retrieve all users with pagination and sorting' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: ApiResponse<PaginationAndSortingResult<UserDto>>,
  })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() findAllUsersDto: PaginationQueryDto,
  ): Promise<ApiResponse<PaginationAndSortingResult<UserDto>>> {
    const findUsers = await this.usersService.findAll(findAllUsersDto);
    return ApiResponse.success(findUsers, HttpStatus.OK);
  }

  @ApiOperation({ summary: 'Update user password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
    type: ApiResponse<string>,
  })
  @ApiNotFoundResponse({ description: 'Invalid password fields' })
  @Patch('updatePassword')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() updatePasswordRequest: UpdatePasswordRequest,
    @Req() request: Request,
  ): Promise<ApiResponse<string>> {
    const userId: string = request.user?.id!;
    const response = await this.usersService.updatePassword(
      updatePasswordRequest,
      userId,
    );
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @ApiOperation({ summary: 'Update User Profile' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: ApiResponse<UserDto>,
  })
  @ApiNotFoundResponse({ description: 'Invalid user data' })
  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<UserDto>> {
    const userId: string = request.user?.id!;
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return ApiResponse.success(updatedUser, HttpStatus.OK);
  }

  @ApiOperation({ summary: 'Retrieve current user profile' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: ApiResponse<UserDto>,
  })
  @Get('current')
  @HttpCode(HttpStatus.OK)
  async getUser(@Req() request: Request): Promise<ApiResponse<UserDto>> {
    const userId: string = request.user?.id!;
    const response = await this.usersService.findOne(userId);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @ApiOperation({ summary: 'Retrieve a single user' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: ApiResponse<UserDto>,
  })
  @ApiNotFoundResponse({ description: 'Invalid used id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserDto>> {
    const response = await this.usersService.findOne(id);
    return ApiResponse.success(response, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<string>> {
    const user: string = await this.usersService.remove(id);
    return ApiResponse.success(user, HttpStatus.OK);
  }
}
