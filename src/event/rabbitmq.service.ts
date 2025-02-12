import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { ConfigInterface } from 'src/config/configuration';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

export interface QueueConfig {
  name: string;
  handler: (content: any) => Promise<void>;
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger: MyLoggerService = new MyLoggerService(
    RabbitMQService.name,
  );
  private channelWrapper: ChannelWrapper;
  private queues: QueueConfig[] = [];

  constructor(private readonly configService: ConfigService<ConfigInterface>) {
    const connection = amqp.connect(
      this.configService.get('queue.rabbitMQUri', { infer: true })!,
    );
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        for (const queue of this.queues) {
          await channel.assertQueue(queue.name, { durable: true });
          await channel.consume(queue.name, async (message) => {
            if (message) {
              try {
                const content = JSON.parse(message.content.toString());
                this.logger.log(
                  `Received message from queue: ${queue.name}`,
                  RabbitMQService.name,
                );
                await queue.handler(content);
                channel.ack(message);
              } catch (error) {
                this.channelWrapper.nack(message);
                this.logger.error(
                  `Error processing message`,
                  RabbitMQService.name,
                );
              }
            }
          });
        }
      });
      this.logger.log(
        'Consumer service started and listening for messages.',
        RabbitMQService.name,
      );
    } catch (err) {
      this.logger.error(
        `Error starting the consumer: ${err.message}`,
        RabbitMQService.name,
      );
    }
  }

  addQueue(config: QueueConfig) {
    this.queues.push(config);
  }

  async addToQueue(queue: string, message: any): Promise<void> {
    await this.channelWrapper.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
    );
    this.logger.log(`Added message to queue: ${queue}`, RabbitMQService.name);
  }
}
