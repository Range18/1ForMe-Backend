import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';

@Entity()
export class Training extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => Sport, (sport) => sport.trainings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sport' })
  sport: Sport;

  @Column({ nullable: false, default: '' })
  status: string;

  @Column({ nullable: false, default: false })
  isFinished: boolean;

  @Column({ nullable: false })
  startTime: Date;

  @Column({ nullable: false })
  endTime: Date;

  @Column({ nullable: false })
  date: Date;

  @ManyToOne(() => UserEntity, (user) => user.trainingsAsClient, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.trainingsAsTrainer, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @ManyToOne(() => TrainingType, (type) => type.trainings, { nullable: false })
  @JoinColumn({ name: 'type' })
  type: TrainingType;
}
