import { Article } from 'src/article/entities/article.entity';
import { User } from 'src/users/entities/user.entity';
import { Auditable } from 'src/utility/autitable.entity';
import { ReactionType } from '../enum/reaction-type.enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';

@Entity()
export class Reaction extends Auditable {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Article, (article) => article.id, { nullable: true })
  article: Article;

  @ManyToOne(() => Comment, (comment) => comment.id, { nullable: true })
  comment: Comment;

  @Column({ type: 'enum', enum: ReactionType })
  reactionType: ReactionType;
}
