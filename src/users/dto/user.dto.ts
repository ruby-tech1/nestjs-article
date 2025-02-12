import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Gender } from '../enum/gender.enum';
import { Type } from 'class-transformer';
import { DateDto } from 'src/utility/date.dto';
import { ApiProperty } from '@nestjs/swagger';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,20}$/;

export class UserDto extends DateDto {
  @ApiProperty({
    type: String,
    description: 'This is the name of the user which is required',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must have at least 3 characters.' })
  name: string;

  @ApiProperty({
    type: String,
    description: 'This is the email of the user which is required',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description:
      'This is the password of the user  which must contain Minimum 8 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, 
    at least one uppercase letter, 
    one lowercase letter, 
    one number and 
    one special character`,
  })
  password?: string;

  @ApiProperty({
    type: String,
    description: 'This is the date of birth of the user which is required',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dob: Date;

  @ApiProperty({
    type: String,
    description:
      'This is the gender of the user which is required and can only be MALE OR FEMALE',
  })
  @IsString()
  @IsEnum(Gender)
  gender: Gender;
}
