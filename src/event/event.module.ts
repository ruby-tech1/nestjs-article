import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationEvent } from './notification-event.service';

@Module({
  imports: [NotificationModule],
  providers: [RabbitMQService, NotificationEvent],
  exports: [RabbitMQService, NotificationEvent],
})
export class EventModule {}
