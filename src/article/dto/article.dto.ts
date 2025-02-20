import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { DateDto } from 'src/utility/date.dto';

export class ArticleDto extends DateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  isPublic: boolean = false;

  @IsOptional()
  @IsDateString()
  releaseTime: Date;

  @IsOptional()
  @IsUUID()
  userId: string;
}
