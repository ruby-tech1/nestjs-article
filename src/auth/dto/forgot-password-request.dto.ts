import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordRequest {
  @IsString()
  @IsEmail()
  email: string;
}
