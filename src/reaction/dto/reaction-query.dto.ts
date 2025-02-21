import { PaginationQueryDto } from 'src/utility/pagination-and-sorting';
import { ReactionEntity } from '../enum/reaction-entity.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReactionType } from '../enum/reaction-type.enum';

export class EntityReactionQueryDto extends PaginationQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  entityId: string;

  @IsEnum(ReactionEntity)
  @IsNotEmpty()
  reactionEntity: ReactionEntity;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  @IsOptional()
  reactionType: ReactionType;
}

export class UserReactionQueryDto extends PaginationQueryDto {
  @IsEnum(ReactionType)
  @IsNotEmpty()
  @IsOptional()
  reactionType: ReactionType;
}
