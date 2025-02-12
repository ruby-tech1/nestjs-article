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
  ValidationPipe,
  UseGuards,
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

  @ApiOperation({ summary: 'Retrieve a single user' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: ApiResponse<UserDto>,
  })
  @ApiNotFoundResponse({ description: 'Invalid used id' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserDto>> {
    const findUsers = await this.usersService.findOne(id);
    return ApiResponse.success(findUsers, HttpStatus.OK);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<string>> {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return ApiResponse.success(updatedUser, HttpStatus.OK);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<ApiResponse<string>> {
    const user: string = await this.usersService.remove(id);
    return ApiResponse.success(user, HttpStatus.OK);
  }
}
