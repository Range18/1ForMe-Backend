import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { Category } from '#src/core/categories/entity/categories.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

@Entity('tariffs')
export class Tariff extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  cost: number;

  @Column({ nullable: false, default: false })
  isPublic: boolean;

  //Only for groups, pairs trainings or subscriptions
  @Column({ nullable: true })
  clientsAmount?: number;

  //Only for subscriptions
  @Column({ nullable: true })
  subExpireAt?: number;

  //Only for subscriptions
  @Column({ nullable: true })
  trainingAmount?: number;

  @Column({ nullable: true })
  strikethroughTrainingPrice?: number;

  @Column({ nullable: false, default: false })
  isForSubscription: boolean;

  @Column({ nullable: true })
  duration?: string;

  @ManyToOne(() => Studio, (studio) => studio.tariffs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studio' })
  studio?: Studio;

  @OneToMany(() => Transaction, (transaction) => transaction.tariff, {
    nullable: true,
  })
  transactions?: Transaction[];

  @ManyToOne(() => Sport, (sport) => sport.tariffs, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'sport' })
  sport: Sport;

  @ManyToOne(() => Category, (category) => category.tariffs, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'category' })
  category?: Category;

  @ManyToOne(() => TrainingType, (type) => type.tariffs, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'type' })
  type?: TrainingType;

  @ManyToMany(() => Clubs, (club) => club.tariffs, {
    nullable: true,
  })
  clubs?: Clubs[];
}
