import {
  Column,
  Entity,
  JoinColumn,
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

  @Column({ nullable: true })
  duration: string;

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

  //Only for groups, pairs
  @Column({ nullable: true })
  clientsAmount?: number;

  //only for subs
  @Column({ nullable: true })
  subExpireAt?: number;

  @Column({ nullable: true })
  trainingAmount?: number;

  @Column({ nullable: false, default: false })
  isForSubscription: boolean;
}
