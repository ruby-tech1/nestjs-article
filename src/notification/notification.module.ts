import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigInterface } from 'src/config/configuration';
import { NotificationService } from './notification.service';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigInterface>) => {
        const emailConfig = configService.get('email', { infer: true });
        const appConfig = configService.get('app', { infer: true });
        if (!emailConfig) {
          throw new Error(
            'Missing configuration for app or database. Check configuration.ts and .env settings.',
          );
        }
        return {
          transport: {
            host: emailConfig.host,
            port: emailConfig.port,
            secure: false,
            auth: {
              user: emailConfig.username,
              pass: emailConfig.password,
            },
            logger: appConfig?.env === 'dev',
            debug: appConfig?.env === 'dev',
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: 'developers@writify.com',
          },
          template: {
            dir: __dirname + '/../templates',
            adapter: new PugAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
