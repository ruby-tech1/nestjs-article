import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthRequestDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
