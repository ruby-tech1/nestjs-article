import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CustomJwtService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    CustomJwtService.name,
  );
  constructor(private readonly jwtService: JwtService) {}

  generateJwtToken(user: User): string {
    return this.jwtService.sign({
      userId: user.id,
    });
  }

  verifyJwtToken(token: string): { [index: string]: string } {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Jwt Error: ${error.message}`, CustomJwtService.name);
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
