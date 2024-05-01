import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { BaseEntity } from '#src/common/base.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => UserEntity, (user) => user.subsAsClient, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.subsAsTrainer, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @OneToMany(() => Training, (training) => training.subscription, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trainings?: Training[];

  @OneToOne(() => Transaction, (transaction) => transaction.subscription, {
    nullable: false,
  })
  transaction: Transaction;

  @Column({ nullable: true })
  expireAt?: Date;
}
