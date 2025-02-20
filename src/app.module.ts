import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigInterface } from './config/configuration';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AuthModule } from './auth/auth.module';
import { MyConfigModule } from './config/config.module';
import { NotificationModule } from './notification/notification.module';
import { EventModule } from './event/event.module';
import { VerificationModule } from './verification/verification.module';
import { TokenModule } from './token/token.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigInterface>) => {
        const appConfig = configService.get('app', { infer: true });
        const databaseConfig = configService.get('database', { infer: true });

        if (!appConfig || !databaseConfig) {
          throw new Error(
            'Missing configuration for app or database. Check configuration.ts and .env settings.',
          );
        }

        return {
          type: 'postgres',
          host: databaseConfig.host,
          port: databaseConfig.port,
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.name,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: appConfig.env === 'dev',
          logging: appConfig.env !== 'prod',
          ssl: appConfig.env === 'prod' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    MyLoggerModule,
    AuthModule,
    MyConfigModule,
    NotificationModule,
    EventModule,
    VerificationModule,
    TokenModule,
    ArticleModule,
    CommentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
