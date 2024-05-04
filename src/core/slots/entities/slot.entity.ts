import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';

@Entity('trainer_slots')
export class Slot extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  beginning: string;

  @Column({ nullable: false })
  end: string;

  @Column({ nullable: false })
  day: string;

  @ManyToOne(() => UserEntity, (user) => user.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @ManyToOne(() => Studio, (studio) => studio.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studio' })
  studio: Studio;
}
