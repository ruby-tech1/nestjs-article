import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigInterface } from 'src/config/configuration';
import { CustomJwtService } from './jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigInterface>) => {
        const token = configService.get('token', { infer: true });
        if (!token) {
          throw new Error(
            'Missing configuration for jwt. Check configuration.ts and .env settings.',
          );
        }
        return {
          secret: token.secret,
          signOptions: {
            expiresIn: token.jwtExpire,
          },
        };
      },
    }),
    ConfigModule,
    TypeOrmModule.forFeature([Token]),
  ],
  providers: [TokenService, CustomJwtService],
  exports: [TokenService, CustomJwtService],
})
export class TokenModule {}
