import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { TransactionStatus } from '#src/core/transactions/types/transaction-status.enum';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  cost: number;

  @Column({
    nullable: false,
    default: TransactionStatus.Unpaid,
    type: 'varchar',
  })
  status: TransactionStatus;

  @OneToOne(() => Subscription, (subs) => subs.transaction, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  subscription?: Subscription;

  @ManyToOne(() => UserEntity, (trainer) => trainer.transactionsFromClients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @ManyToOne(() => UserEntity, (client) => client.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => Tariff, (tariff) => tariff.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'tariff' })
  tariff: Tariff;

  @Column({ nullable: true, type: 'date' })
  createdDate: Date;

  @OneToOne(() => Training, (training) => training.transaction, {
    nullable: true,
  })
  training?: Training;
}
