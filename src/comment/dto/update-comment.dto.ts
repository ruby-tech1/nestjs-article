import { PartialType } from '@nestjs/swagger';
import { CommentDto } from './comment.dto';

export class UpdateCommentDto extends PartialType(CommentDto) {}
