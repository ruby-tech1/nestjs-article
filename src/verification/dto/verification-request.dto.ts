import { User } from 'src/users/entities/user.entity';
import { NotificationType } from 'src/notification/notification-type.enum';

export class VerificationRequest {
  notificationType: NotificationType;

  tokenType: 'otp' | 'token';

  user: User;

  // token?: string;
}
