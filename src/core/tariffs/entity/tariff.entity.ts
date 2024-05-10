import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';

@Entity('tariffs')
export class Tariff extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  cost: number;

  @ManyToOne(() => UserEntity, (user) => user.tariffs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: UserEntity;

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

  //only for subs
  @Column({ nullable: true })
  subExpireAt?: Date;

  @Column({ nullable: true })
  trainingAmount?: number;

  @Column({ nullable: false, default: false })
  isForSubscription: boolean;
}
