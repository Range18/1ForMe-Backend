import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { BaseEntity } from '#src/common/base.entity';

@Entity('sessions')
export class SessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => UserEntity, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  readonly user: UserEntity;

  @Column()
  @Generated('uuid')
  sessionId: string;

  @Column({ nullable: false })
  expireAt: Date;
}
