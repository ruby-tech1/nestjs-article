import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DateDto } from 'src/utility/date.dto';

export class CommentDto extends DateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  userId: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  articleId: string;
}
