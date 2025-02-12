import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { EmailRequest } from './dto/email-request.dto';

@Injectable()
export class NotificationService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    NotificationService.name,
  );

  constructor(private readonly mailerService: MailerService) {}

  private async sendMail(
    to: string | string[],
    subject: string,
    template: string,
    context: ISendMailOptions['context'],
  ): Promise<void> {
    const sendMailParams = {
      to,
      from: 'developers@writify.com',
      subject,
      template,
      context,
    };

    try {
      const response = await this.mailerService.sendMail(sendMailParams);
      this.logger.log(`Email sent`, NotificationService.name);
    } catch (error) {
      this.logger.error(
        `Error while sending email, Message: ${error.message}`,
        NotificationService.name,
      );
      throw new Error('Error while sending email');
    }
  }

  async sendEmailVerificationMail(emailRequest: EmailRequest): Promise<void> {
    await this.sendMail(
      emailRequest.to,
      'Account Registration Confirmation',
      'signup-confirmation-email-template',
      emailRequest.context,
    );
  }

  async sendVerificationNotificationMail(
    emailRequest: EmailRequest,
  ): Promise<void> {
    await this.sendMail(
      emailRequest.to,
      'Account Verification Notification',
      'account-verification-email-template',
      emailRequest.context,
    );
  }
}
