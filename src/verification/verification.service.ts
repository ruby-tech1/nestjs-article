import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { Repository } from 'typeorm';
import { VerificationRequest } from './dto/verification-request.dto';
import { HashUtility } from 'src/utility/hash-utility';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { NotificationEvent } from 'src/event/notification-event.service';
import { NotificationType } from 'src/notification/notification-type.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from 'src/config/configuration';
import { DateUtility } from 'src/utility/date-utility';

@Injectable()
export class VerificationService {
  private logger: MyLoggerService = new MyLoggerService(
    VerificationService.name,
  );

  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly userService: UsersService,
    private readonly notificationEvent: NotificationEvent,
    private readonly configService: ConfigService<ConfigInterface>,
  ) {}

  async create(verificationRequest: VerificationRequest): Promise<void> {
    const { tokenType, user, notificationType } = verificationRequest;

    const verification: Verification | null = await this.findVerification(
      notificationType,
      user.id,
    );
    if (verification) {
      this.verificationRepository.remove(verification);
    }

    let token: string =
      tokenType === 'token'
        ? HashUtility.generateRandomHash()
        : HashUtility.generateSecureNumber();

    const expireAt = DateUtility.currentDate;
    expireAt.setMinutes(expireAt.getMinutes() + 15);

    const savedVerification: Verification =
      await this.verificationRepository.create({
        token: await HashUtility.generateHashValue(token),
        notificationType,
        user,
        expireAt,
      });
    this.verificationRepository.save(savedVerification);

    let context: { [index: string]: any } = { name: user.name };

    if (notificationType === NotificationType.ACCOUNTVERIFICATION) {
      context.verificationLink = `${this.configService.get('app.frontendHost', { infer: true })}/verifyUser/?token=${token}&email=${user.email}`;
    }

    if (notificationType === NotificationType.PASSWORDRESET) {
      context.otp = token;
    }

    await this.notificationEvent.sendEmailRequest({
      type: notificationType,
      to: user.email,
      context,
    });

    this.logger.log(
      `Verification of type: ${notificationType} sent`,
      VerificationService.name,
    );
  }

  async verify(
    verificationRequest: VerificationRequest,
    token: string,
  ): Promise<void> {
    const { user, notificationType } = verificationRequest;

    const verification: Verification | null = await this.findVerification(
      notificationType,
      user.id,
    );

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    const currentTime: Date = DateUtility.currentDate;
    if (verification.expireAt < currentTime) {
      await this.verificationRepository.delete(verification);
      throw new BadRequestException('Expired Verification');
    }

    if (!(await HashUtility.compareHash(token, verification.token))) {
      throw new BadRequestException('Invalid Verification');
    }

    verification.verified = true;
    await this.verificationRepository.save(verification);
    await this.verificationRepository.softRemove(verification);
  }

  private async findVerification(
    notificationType: NotificationType,
    userId: string,
  ): Promise<Verification | null> {
    const user: User = await this.userService.findUser(userId);
    return await this.verificationRepository.findOneBy({
      notificationType,
      user: { id: userId },
    });
  }
}
