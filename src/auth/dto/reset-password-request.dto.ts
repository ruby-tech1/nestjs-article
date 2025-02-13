import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { passwordRegEx } from 'src/users/dto/user.dto';

export class ResetPasswordRequest {
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  token: string;

  @IsString()
  @IsOptional()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, 
    at least one uppercase letter, 
    one lowercase letter, 
    one number and 
    one special character`,
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  repeatPassword: string;
}
