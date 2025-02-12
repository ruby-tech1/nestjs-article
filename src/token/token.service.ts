import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { User } from 'src/users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { DateUtility } from 'src/utility/date-utility';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from 'src/config/configuration';

@Injectable()
export class TokenService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    TokenService.name,
  );
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService<ConfigInterface>,
  ) {}

  async createToken(user: User, request: Request): Promise<Token> {
    const userAgent: string = request.get('user-agent')!;
    const ip =
      this.configService.get('app.env', { infer: true }) === 'prod'
        ? (request.headers['x-forwarded-for'] as string) ||
          request.ip ||
          request.socket.remoteAddress
        : request.ip || request.socket.remoteAddress;

    let token: Token | null = await this.tokenRepository.findOneBy({
      userAgent,
      valid: true,
      user: { id: user.id },
    });

    if (token && token.expireAt > DateUtility.currentDate) {
      return token;
    }

    const refreshToken: string = uuidv4();
    const expireAt: Date = DateUtility.currentDate;
    expireAt.setDate(expireAt.getDate() + 2);

    token = this.tokenRepository.create({
      expireAt,
      refreshToken,
      ip,
      user,
      userAgent,
    });
    const newToken: Token = await this.tokenRepository.save(token);

    this.logger.log(`Token Created`, TokenService.name);
    return newToken;
  }

  async verifyToken(refreshToken: string, userId: string): Promise<Token> {
    const token: Token | null = await this.tokenRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!token || token.user.id !== userId) {
      throw new UnauthorizedException('Invalid Token Credentials');
    }

    if (token.expireAt < DateUtility.currentDate) {
      await this.revokeToken(refreshToken);
      throw new UnauthorizedException('Token Expired');
    }

    return token;
  }

  async revokeToken(refreshToken: string): Promise<void> {
    const token: Token | null = await this.tokenRepository.findOneBy({
      refreshToken,
    });

    if (!token) {
      throw new UnauthorizedException('Invalid Token');
    }

    token.valid = false;
    await this.tokenRepository.save(token);
  }
}
