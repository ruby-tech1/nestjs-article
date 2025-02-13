import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from 'src/config/configuration';
import { EmailRequest } from 'src/notification/dto/email-request.dto';
import { NotificationType } from 'src/notification/notification-type.enum';

@Injectable()
export class NotificationEvent {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rabbitService: RabbitMQService,
    private readonly configService: ConfigService<ConfigInterface>,
  ) {
    this.setupQueue();
  }

  private setupQueue(): void {
    this.rabbitService.addQueue({
      name: this.configService.get('queue.emailQueue', { infer: true })!,
      handler: async (emailRequest: EmailRequest): Promise<void> => {
        if (emailRequest.type === NotificationType.ACCOUNTVERIFICATION) {
          await this.notificationService.sendAccountVerificationMail(
            emailRequest,
          );
        }

        if (emailRequest.type === NotificationType.ACCOUNTREGISTRATION) {
          await this.notificationService.sendRegistrationNotificationMail(
            emailRequest,
          );
        }

        if (emailRequest.type === NotificationType.PASSWORDRESET) {
          await this.notificationService.sendResetPasswordNotificationMail(
            emailRequest,
          );
        }
      },
    });
  }

  async sendEmailRequest(emailRequest: EmailRequest): Promise<void> {
    await this.rabbitService.addToQueue(
      this.configService.get('queue.emailQueue', { infer: true })!,
      emailRequest,
    );
  }
}
