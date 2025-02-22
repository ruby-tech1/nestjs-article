import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Article } from './entities/article.entity';
import {
  And,
  ILike,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { ArticleDto } from './dto/article.dto';
import { User } from 'src/users/entities/user.entity';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import {
  PaginationAndSorting,
  PaginationAndSortingResult,
  PaginationQueryDto,
} from 'src/utility/pagination-and-sorting';
import { UpdateArticleDto } from './dto/update-article.dto';
import { DateUtility } from 'src/utility/date-utility';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ArticleService {
  private readonly logger: MyLoggerService = new MyLoggerService(
    ArticleService.name,
  );

  constructor(
    private readonly userService: UsersService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(articleDto: ArticleDto, userId: string): Promise<ArticleDto> {
    const { title, description, content, releaseTime, isPublic } = articleDto;

    const user: User = await this.userService.findUser(userId);

    if (
      (!isPublic && !releaseTime) ||
      new Date(releaseTime) < DateUtility.currentDate
    ) {
      throw new BadRequestException(
        'Please provide a release time for the article',
      );
    }

    const newReleaseTime =
      releaseTime && !isPublic
        ? new Date(releaseTime)
        : DateUtility.currentDate;

    const article: Article = this.articleRepository.create({
      title,
      description,
      content,
      user,
      releaseTime: newReleaseTime,
      isPublic,
    });

    const savedArticle: Article = await this.articleRepository.save(article);

    this.logger.log(`User created article`, ArticleService.name);
    return this.convertToDto(savedArticle);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleArticleRelease(): Promise<void> {
    this.logger.log(
      `Checking for article scheduled for release`,
      ArticleService.name,
    );
    const articles: Article[] = await this.articleRepository.find({
      where: {
        isPublic: false,
        releaseTime: And(Not(IsNull()), LessThan(DateUtility.currentDate)),
      },
    });

    for (let article of articles) {
      article.isPublic = true;
    }

    await this.articleRepository.save(articles);
    this.logger.log(
      `Released articles scheduled for release`,
      ArticleService.name,
    );
  }

  async findOne(articleId: string, userId: string): Promise<ArticleDto> {
    const article: Article = await this.findArticle(articleId);

    if (!article.isPublic && article.user.id !== userId) {
      throw new NotFoundException('Article not found');
    }

    this.logger.log(
      `User retrieved article with id: ${articleId}`,
      ArticleService.name,
    );
    return this.convertToDto(article);
  }

  async findArticle(
    articleId: string,
    relations: string[] = ['user'],
  ): Promise<Article> {
    const article: Article | null = await this.articleRepository.findOne({
      where: { id: articleId },
      relations,
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async findAll(
    findArticleQuery: PaginationQueryDto,
  ): Promise<PaginationAndSortingResult<ArticleDto>> {
    const findOptions = PaginationAndSorting.createFindOptions<Article>(
      ['title', 'description'],
      findArticleQuery,
      { user: { name: ILike(`%${findArticleQuery.search}%`) } },
      { isPublic: true },
      ['user'],
    );
    const [articles, total]: [Article[], number] =
      await this.articleRepository.findAndCount(findOptions);

    this.logger.log(`Retrieved list of article`, ArticleService.name);

    return PaginationAndSorting.getPaginateResult<Article, ArticleDto>(
      articles,
      total,
      findArticleQuery,
      this.convertToDto,
    );
  }

  async findAllUser(
    findArticleQuery: PaginationQueryDto,
    userId: string,
  ): Promise<PaginationAndSortingResult<ArticleDto>> {
    const findOptions = PaginationAndSorting.createFindOptions<Article>(
      ['title', 'description'],
      findArticleQuery,
      { user: { id: userId } },
      undefined,
      ['user'],
    );
    const [articles, total]: [Article[], number] =
      await this.articleRepository.findAndCount(findOptions);

    this.logger.log(`Retrieved user list of article`, ArticleService.name);

    return PaginationAndSorting.getPaginateResult<Article, ArticleDto>(
      articles,
      total,
      findArticleQuery,
      this.convertToDto,
    );
  }

  async update(
    articleId: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
  ): Promise<ArticleDto> {
    const {
      title,
      description,
      content,
      isPublic,
      releaseTime,
    }: UpdateArticleDto = updateArticleDto;
    const article: Article = await this.findArticle(articleId);

    if (article.user.id !== userId) {
      throw new UnauthorizedException('Cannot modify article');
    }

    if (title) {
      article.title = title;
    }

    if (description) {
      article.description = description;
    }

    if (content) {
      article.content = content;
    }

    if (isPublic) {
      article.isPublic = isPublic!;
      article.releaseTime = DateUtility.currentDate;
    }

    if (releaseTime) {
      if (!article.isPublic) {
        throw new BadRequestException(
          'Unable to update release time after article publish',
        );
      }

      article.releaseTime = new Date(releaseTime);
    }

    const savedArticle: Article = await this.articleRepository.save(article);

    this.logger.log(`Updated article by user`, ArticleService.name);
    return this.convertToDto(savedArticle);
  }

  async delete(articleId: string, userId: string): Promise<string> {
    const article: Article = await this.findArticle(articleId);

    if (article.user.id !== userId) {
      throw new UnauthorizedException('Cannot modify article');
    }

    await this.articleRepository.softRemove(article);

    this.logger.log(`Article deleted by user`, ArticleService.name);
    return 'Article delete successfully';
  }

  convertToDto(article: Article): ArticleDto {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      userId: article.user.id,
      releaseTime: article.releaseTime,
      isPublic: article.isPublic,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      deletedAt: article.deletedAt,
    };
  }
}
