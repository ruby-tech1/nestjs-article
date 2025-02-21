import { DateDto } from 'src/utility/date.dto';
import { ReactionType } from '../enum/reaction-type.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReactionEntity } from '../enum/reaction-entity.enum';

export class ReactionDto extends DateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  articleId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  commentId?: string;

  @IsEnum(ReactionEntity)
  @IsNotEmpty()
  reactionEntity?: ReactionEntity;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  reactionType: ReactionType;
}
