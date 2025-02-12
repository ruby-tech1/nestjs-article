import { NotificationType } from '../notification-type.enum';

export class EmailRequest {
  type: NotificationType;

  subject?: string;

  to: string | string[];

  template?: string;

  context: {
    [index: string]: string;
  };
}
