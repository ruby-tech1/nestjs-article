import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Auditable } from 'src/utility/autitable.entity';
import { Gender } from '../enum/gender.enum';
import { Verification } from 'src/verification/entities/verification.entity';

@Entity()
export class User extends Auditable {
  @Column({ type: 'character varying', length: 100 })
  name: string;

  @Column({ type: 'character varying', unique: true })
  @Index('idx_email', { unique: true })
  email: string;

  @Column({ type: 'character varying' })
  password: string;

  @Column({ type: 'character varying' })
  dob: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  // @OneToMany(() => Verification, (verification) => verification.user)
  // verifications: Promise<Verification[]>;
}
