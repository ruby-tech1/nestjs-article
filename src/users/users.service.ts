import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import AppConstants from 'src/utility/app-constants';
import {
  PaginationAndSorting,
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@Injectable()
export class UsersService {
  saltOrRounds: number = 10;
  logger: MyLoggerService = new MyLoggerService(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    findAllUsersDto: PaginationQueryDto,
  ): Promise<PaginationAndSortingResult<UserDto>> {
    const findOptions = PaginationAndSorting.createFindOptions(
      'name',
      findAllUsersDto,
    );
    const [users, total]: [User[], number] =
      await this.userRepository.findAndCount(findOptions);

    this.logger.log('Retrieves all users', UsersService.name);

    return PaginationAndSorting.getPaginateResult<User, UserDto>(
      users,
      total,
      findAllUsersDto,
      this.convertToDto,
    );
  }

  async findOne(id: string): Promise<UserDto> {
    try {
      const findUser: User = await this.userRepository.findOneByOrFail({ id });

      this.logger.log(`Retrieves a user wit id: ${id}`, UsersService.name);
      return this.convertToDto(findUser);
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async findUser(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  convertToDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      dob: user.dob,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
