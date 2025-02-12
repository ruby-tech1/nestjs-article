import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from 'src/users/dto/user.dto';
import AppConstants from 'src/utility/app-constants';
import { NotificationEvent } from 'src/event/notification-event.service';
import { HashUtility } from 'src/utility/hash-utility';
import { VerificationService } from 'src/verification/verification.service';
import { NotificationType } from 'src/notification/notification-type.enum';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyUserDto } from './dto/verify-user-request.dto';
import { AuthRequestDto } from './dto/auth-request.dto';
import { CustomJwtService } from 'src/token/jwt.service';
import { UsersService } from 'src/users/users.service';
import { DateUtility } from 'src/utility/date-utility';
import { TokenService } from 'src/token/token.service';
import { Request } from 'express';
import { Token } from 'src/token/entities/token.entity';
import { RefreshTokenRequest } from './dto/refresh-token-request.dto';

@Injectable()
export class AuthService {
  private logger: MyLoggerService = new MyLoggerService(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly notificationEvent: NotificationEvent,
    private readonly jwtService: CustomJwtService,
    private readonly tokenService: TokenService,
  ) {}

  async register(userDto: UserDto): Promise<string> {
    const { name, email, password, dob, gender } = userDto;

    const existingUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (existingUser && existingUser.enabled) {
      throw new BadRequestException('Email is already in use.');
    } else if (existingUser && !existingUser.enabled) {
      this.userRepository.remove(existingUser);
    }

    const newDob = new Date(dob);
    if (newDob > DateUtility.validDob) {
      throw new BadRequestException('Invalid Date of birth');
    }

    const user: User = this.userRepository.create({
      name: name,
      email: email,
      password: await HashUtility.generateHashValue(password!),
      gender: gender,
      dob: dob,
    });

    const savedUser: User = await this.userRepository.save(user);
    await this.verificationService.create({
      tokenType: 'token',
      notificationType: NotificationType.EMAILVERIFICATION,
      user: savedUser,
    });

    this.logger.log(`User Created: ${savedUser.email}`, AuthService.name);
    return 'Confirm your account in the email sent';
  }

  async verifyUser(verifyDto: VerifyUserDto): Promise<string> {
    const { email, token } = verifyDto;

    const user: User = await this.userRepository.findOneByOrFail({ email });

    await this.verificationService.verify(
      {
        notificationType: NotificationType.EMAILVERIFICATION,
        tokenType: 'token',
        user,
      },
      token,
    );

    user.enabled = true;
    this.userRepository.save(user);

    await this.notificationEvent.sendEmailRequest({
      to: user.email,
      type: NotificationType.ACCOUNTVERIFICATION,
      context: {
        name: user.name,
      },
    });

    this.logger.log(`Verified user: ${user.email}`, AuthService.name);
    return 'User Verified';
  }

  async login(
    authRequest: AuthRequestDto,
    request: Request,
  ): Promise<AuthResponseDto> {
    const { email, password } = authRequest;

    const user: User | null = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException(`Invalid Credentials`);
    }
    if (!user.enabled) {
      throw new UnauthorizedException(`Verify account before signing in`);
    }

    if (!(await HashUtility.compareHash(password, user.password))) {
      throw new UnauthorizedException(`Invalid Credentials`);
    }

    const tokens: [string, string] = await this.generateToken(user, request);

    return {
      user: this.userService.convertToDto(user),
      accessToken: tokens[0],
      refreshToken: tokens[1],
    };
  }

  async refreshToken(
    refreshRequest: RefreshTokenRequest,
    request: Request,
  ): Promise<AuthResponseDto> {
    const token: Token = await this.tokenService.verifyToken(
      refreshRequest.refreshToken,
      refreshRequest.userId,
    );

    const tokens: [string, string] = await this.generateToken(
      token.user,
      request,
    );
    return {
      accessToken: tokens[0],
      refreshToken: tokens[1],
    };
  }

  private async generateToken(
    user: User,
    request: Request,
  ): Promise<[string, string]> {
    const accessToken: string = this.jwtService.generateJwtToken(user);
    const token: Token = await this.tokenService.createToken(user, request);

    return [accessToken, token.refreshToken];
  }
}
