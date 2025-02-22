import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { passwordRegEx } from './user.dto';

export class UpdatePasswordRequest {
  @IsString()
  @IsNotEmpty()
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
