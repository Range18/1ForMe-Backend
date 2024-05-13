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

@Entity('tariffs')
export class Tariff extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  cost: number;

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
  })
  @JoinColumn({ name: 'sport' })
  sport: Sport;

  @ManyToOne(() => Category, (category) => category.tariffs, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category' })
  category?: Category;

  //only for subs
  @Column({ nullable: true })
  subExpireAt?: number;

  @Column({ nullable: true })
  trainingAmount?: number;

  @Column({ nullable: false, default: false })
  isForSubscription: boolean;
}
