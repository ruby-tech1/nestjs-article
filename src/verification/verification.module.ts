import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from 'src/event/event.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    UsersModule,
    ConfigModule,
    EventModule,
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
