import { User } from 'src/users/entities/user.entity';
import { Auditable } from 'src/utility/autitable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NotificationType } from 'src/notification/notification-type.enum';

@Entity()
export class Verification extends Auditable {
  @Column({ type: 'character varying', unique: true })
  token: string;

  @Column({ type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ type: 'timestamp' })
  expireAt: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @ManyToOne(() => User, (user) => user.verifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
