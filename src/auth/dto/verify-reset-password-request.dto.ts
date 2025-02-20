import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyResetPasswordRequest {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  token: string;
}
