import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from 'src/article/article.module';
import { UsersModule } from 'src/users/users.module';
import { CommentModule } from 'src/comment/comment.module';
import { Reaction } from './entities/reaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction]),
    UsersModule,
    ArticleModule,
    CommentModule,
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
