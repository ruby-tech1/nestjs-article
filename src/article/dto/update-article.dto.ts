import { PartialType } from '@nestjs/mapped-types';
import { ArticleDto } from './article.dto';

export class UpdateArticleDto extends PartialType(ArticleDto) {}
