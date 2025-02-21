import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReactionDto } from './dto/reaction.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Reaction } from './entities/reaction.entity';
import { User } from 'src/users/entities/user.entity';
import { ReactionEntity } from './enum/reaction-entity.enum';
import {
  PaginationAndSorting,
  PaginationAndSortingResult,
} from 'src/utility/pagination-and-sorting';
import {
  EntityReactionQueryDto,
  UserReactionQueryDto,
} from './dto/reaction-query.dto';
import { ReactionNumberDto } from './dto/reaction-number.dto';
import { ReactionType } from './enum/reaction-type.enum';
import { ReactionNumberRequest } from './dto/reaction-number-request.dto';
import { ArticleService } from 'src/article/article.service';
import { Article } from 'src/article/entities/article.entity';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entities/comment.entity';

@Injectable()
export class ReactionService {
  private logger: MyLoggerService = new MyLoggerService(ReactionService.name);

  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    private readonly userService: UsersService,
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
  ) {}

  async create(
    createReactionDto: ReactionDto,
    userId: string,
  ): Promise<boolean> {
    const { articleId, commentId, reactionEntity, reactionType }: ReactionDto =
      createReactionDto;

    const findOptions: { article?: {}; comment?: {} } = {};

    if (reactionEntity === ReactionEntity.ARTICLE) {
      if (!articleId) {
        throw new BadRequestException('Article id is empty');
      }

      const article: Article = await this.articleService.findArticle(
        articleId!,
      );
      if (!article.isPublic) {
        throw new NotFoundException('Article not found');
      }

      findOptions.article = { id: articleId };
    }

    if (reactionEntity === ReactionEntity.COMMENT) {
      if (!commentId) {
        throw new BadRequestException('Comment id is empty');
      }

      const comment: Comment = await this.commentService.findComment(
        commentId!,
      );
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      findOptions.comment = { id: commentId };
    }

    let reaction: Reaction | null = await this.reactionRepository.findOne({
      where: {
        user: { id: userId },
        reactionType,
        ...findOptions,
      },
    });

    if (reaction) {
      await this.reactionRepository.softRemove(reaction);
      return false;
    }

    const user: User = await this.userService.findUser(userId);

    reaction = this.reactionRepository.create({
      user,
      reactionType,
      ...findOptions,
    });

    await this.reactionRepository.save(reaction);

    this.logger.log(
      `User: ${userId} made a reaction: ${reactionType}`,
      ReactionService.name,
    );
    return true;
  }

  async findAllByEntity(
    findReactionQuery: EntityReactionQueryDto,
  ): Promise<PaginationAndSortingResult<ReactionDto>> {
    const compulsoryFindOption: { [index: string]: {} } = {};
    if (findReactionQuery.reactionType) {
      compulsoryFindOption.reactionType = findReactionQuery.reactionType;
    }

    if (findReactionQuery.reactionEntity === ReactionEntity.ARTICLE) {
      compulsoryFindOption.article = { id: findReactionQuery.entityId };
    }

    if (findReactionQuery.reactionEntity === ReactionEntity.COMMENT) {
      compulsoryFindOption.comment = { id: findReactionQuery.entityId };
    }

    const findOptions = PaginationAndSorting.createFindOptions(
      null,
      findReactionQuery,
      {},
      compulsoryFindOption,
      ['comment', 'article', 'user'],
    );
    const [reactions, total] =
      await this.reactionRepository.findAndCount(findOptions);

    return PaginationAndSorting.getPaginateResult(
      reactions,
      total,
      findReactionQuery,
      this.convertToDto,
    );
  }

  async findAllByUser(
    findReactionQuery: UserReactionQueryDto,
    userId: string,
  ): Promise<PaginationAndSortingResult<ReactionDto>> {
    const compulsoryFindOption: { [index: string]: {} } = {
      user: { id: userId },
    };
    if (findReactionQuery.reactionType) {
      compulsoryFindOption.reactionType = findReactionQuery.reactionType;
    }

    const findOptions = PaginationAndSorting.createFindOptions(
      null,
      findReactionQuery,
      {},
      compulsoryFindOption,
      ['comment', 'article', 'user'],
    );
    const [reactions, total] =
      await this.reactionRepository.findAndCount(findOptions);

    return PaginationAndSorting.getPaginateResult(
      reactions,
      total,
      findReactionQuery,
      this.convertToDto,
    );
  }

  async findReactionNumber(
    reactionNumberRequest: ReactionNumberRequest,
  ): Promise<ReactionNumberDto> {
    const { reactionEntity, entityId }: ReactionNumberRequest =
      reactionNumberRequest;

    let totalLikes: number = 0;
    let totalSaves: number = 0;

    if (reactionEntity === ReactionEntity.ARTICLE) {
      totalLikes = await this.reactionRepository.count({
        where: { article: { id: entityId }, reactionType: ReactionType.LIKE },
      });

      totalSaves = await this.reactionRepository.count({
        where: { article: { id: entityId }, reactionType: ReactionType.SAVE },
      });
    }

    if (reactionEntity === ReactionEntity.COMMENT) {
      totalSaves = await this.reactionRepository.count({
        where: { comment: { id: entityId }, reactionType: ReactionType.SAVE },
      });

      totalLikes = await this.reactionRepository.count({
        where: { comment: { id: entityId }, reactionType: ReactionType.LIKE },
      });
    }

    return { saves: totalSaves, likes: totalLikes };
  }

  convertToDto(reaction: Reaction): ReactionDto {
    return {
      id: reaction.id,
      userId: reaction.user.id,
      commentId: reaction.comment ? reaction.comment.id : undefined,
      articleId: reaction.article ? reaction.article.id : undefined,
      reactionType: reaction.reactionType,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    };
  }
}
