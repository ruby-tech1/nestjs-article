import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { EventModule } from 'src/event/event.module';
import { VerificationModule } from 'src/verification/verification.module';

@Module({
  imports: [UsersModule, VerificationModule, EventModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
