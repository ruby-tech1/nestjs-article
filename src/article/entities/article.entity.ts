import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { Auditable } from 'src/utility/autitable.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Article extends Auditable {
  @Column({ type: 'character varying', unique: true })
  @Index('idx_title', { unique: true })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'timestamp without time zone', nullable: true })
  releaseTime: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.article, {
    cascade: ['soft-remove', 'remove'],
  })
  comments: Comment[];
}
