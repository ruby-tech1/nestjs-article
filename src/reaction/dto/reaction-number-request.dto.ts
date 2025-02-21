import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReactionEntity } from '../enum/reaction-entity.enum';
import { ReactionType } from '../enum/reaction-type.enum';

export class ReactionNumberRequest {
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(ReactionEntity)
  @IsNotEmpty()
  reactionEntity: ReactionEntity;
}
