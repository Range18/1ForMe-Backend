import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { TransactionStatus } from '#src/core/transactions/transaction-status.type';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: true })
  customCost?: number;

  @Column({ nullable: false, default: TransactionStatus.Unpaid })
  status: string;

  @ManyToOne(() => UserEntity, (trainer) => trainer.transactionsFromClients, {
    nullable: false,
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @ManyToOne(() => UserEntity, (client) => client.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => Tariff, (tariff) => tariff.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'tariff' })
  tariff: Tariff;

  @ManyToOne(() => Sport, (sport) => sport.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: 'sport' })
  sport: Sport;
}
