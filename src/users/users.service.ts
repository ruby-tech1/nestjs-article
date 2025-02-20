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
import { ResetPasswordRequest } from 'src/auth/dto/reset-password-request.dto';
import { HashUtility } from 'src/utility/hash-utility';
import { DateUtility } from 'src/utility/date-utility';
import { UpdatePasswordRequest } from './dto/update-password-request.dto';

@Injectable()
export class UsersService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    UsersService.name,
  );

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    findAllUsersDto: PaginationQueryDto,
  ): Promise<PaginationAndSortingResult<UserDto>> {
    const findOptions = PaginationAndSorting.createFindOptions<User>(
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
      return await this.userRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async updatePassword(
    updatePasswordRequest: UpdatePasswordRequest,
    userId: string,
  ): Promise<string> {
    const { oldPassword, newPassword, repeatPassword } = updatePasswordRequest;
    const user: User = await this.findUser(userId);

    if (newPassword !== repeatPassword) {
      throw new BadRequestException('Password field are not the same');
    }

    if (!(await HashUtility.compareHash(oldPassword, user.password))) {
      throw new BadRequestException('Incorrect old password');
    }

    user.password = await HashUtility.generateHashValue(newPassword);
    await this.userRepository.save(user);

    this.logger.log(`User changed password`, UsersService.name);
    return 'Password changed successfully';
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const { name, dob, gender } = updateUserDto;

    const user: User = await this.findUser(userId);

    if (name) {
      user.name = name;
    }

    if (dob) {
      const newDob = new Date(dob);
      if (newDob > DateUtility.validDob) {
        throw new BadRequestException('Invalid Date of Birth');
      }

      user.dob = newDob;
    }

    if (gender) {
      user.gender = gender;
    }

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User updated profile`, UsersService.name);
    return this.convertToDto(savedUser);
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
