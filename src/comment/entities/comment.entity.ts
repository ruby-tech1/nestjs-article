import { Article } from 'src/article/entities/article.entity';
import { User } from 'src/users/entities/user.entity';
import { Auditable } from 'src/utility/autitable.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Comment extends Auditable {
  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Article, (article) => article.id)
  article: Article;
}
