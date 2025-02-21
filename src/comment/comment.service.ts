import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentDto } from './dto/comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { ArticleService } from 'src/article/article.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Article } from 'src/article/entities/article.entity';
import {
  PaginationAndSorting,
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';

@Injectable()
export class CommentService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    CommentService.name,
  );

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly articleService: ArticleService,
    private readonly userService: UsersService,
  ) {}

  async create(
    createCommentDto: CommentDto,
    userId: string,
  ): Promise<CommentDto> {
    const { title, content, articleId }: CommentDto = createCommentDto;

    const user: User = await this.userService.findUser(userId);
    const article: Article = await this.articleService.findArticle(
      articleId,
      [],
    );

    const comment: Comment = this.commentRepository.create({
      title,
      content,
      user,
      article,
    });

    const savedComment = await this.commentRepository.save(comment);

    this.logger.log(
      `User: ${user.id} created comment for article: ${article.id}`,
    );
    return this.convertToDto(savedComment);
  }

  async findAllByArticle(
    findCommentsQuery: PaginationQueryDto,
    articleId: string,
  ): Promise<PaginationAndSortingResult<CommentDto>> {
    const findOptions = PaginationAndSorting.createFindOptions(
      ['title', 'content'],
      findCommentsQuery,
      {},
      { article: { id: articleId } },
      ['user', 'article'],
    );
    const [comments, total] =
      await this.commentRepository.findAndCount(findOptions);

    this.logger.log(`List comments retrieved for article: ${articleId}`);
    return PaginationAndSorting.getPaginateResult(
      comments,
      total,
      findCommentsQuery,
      this.convertToDto,
    );
  }

  async findAllByUser(
    findCommentsQuery: PaginationQueryDto,
    userId: string,
  ): Promise<PaginationAndSortingResult<CommentDto>> {
    const findOptions = PaginationAndSorting.createFindOptions(
      ['title', 'content'],
      findCommentsQuery,
      {},
      { user: { id: userId } },
      ['user', 'article'],
    );
    const [comments, total] =
      await this.commentRepository.findAndCount(findOptions);

    this.logger.log(`List comments retrieved for user: ${userId}`);
    return PaginationAndSorting.getPaginateResult(
      comments,
      total,
      findCommentsQuery,
      this.convertToDto,
    );
  }

  async findOne(commentId: string): Promise<CommentDto> {
    const comment: Comment = await this.findComment(commentId);

    this.logger.log(`Retrieved a single comment: ${commentId}`);
    return this.convertToDto(comment);
  }

  async findComment(
    commentId: string,
    relations: string[] = ['user', 'article'],
  ): Promise<Comment> {
    const comment: Comment | null = await this.commentRepository.findOne({
      where: { id: commentId },
      relations,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    updateCommentDto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ): Promise<CommentDto> {
    const { title, content }: UpdateCommentDto = updateCommentDto;

    const comment: Comment = await this.findComment(commentId);

    if (comment.user.id !== userId) {
      throw new UnauthorizedException('Cannot update comment');
    }

    if (title) {
      comment.title = title;
    }

    if (content) {
      comment.content = content;
    }

    const savedComment = await this.commentRepository.save(comment);

    this.logger.log(`Updated a comment: ${commentId}`);
    return this.convertToDto(savedComment);
  }

  async remove(commentId: string, userId: string): Promise<string> {
    const comment: Comment = await this.findComment(commentId);

    if (comment.user.id !== userId) {
      throw new UnauthorizedException('Unable to modify comment');
    }

    await this.commentRepository.softRemove(comment);

    this.logger.log(`Deleted a comment: ${commentId}`);
    return `Comment deleted successfully`;
  }

  convertToDto(comment: Comment): CommentDto {
    return {
      id: comment.id,
      title: comment.title,
      content: comment.content,
      userId: comment.user.id,
      articleId: comment.article.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
